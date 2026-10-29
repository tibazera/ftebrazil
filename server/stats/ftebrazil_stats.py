#!/usr/bin/env python3
"""Ranking e nicks registrados do FTE Brazil.

Consulta o fteqw-sv local a cada poucos segundos (pacote "status"), soma os
frags ganhos por cada jogador num SQLite e expõe uma API HTTP pequena para o
site. Nicks registrados exigem um token na userinfo (_ftb); quem usar um nick
registrado sem o token certo é expulso via rcon.

Só biblioteca padrão. Configuração por variáveis de ambiente (ver stats.env).
"""
import hashlib
import hmac
import json
import os
import re
import secrets
import socket
import sqlite3
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

QW_HOST, QW_PORT = os.environ.get("QW_ADDR", "127.0.0.1:27500").rsplit(":", 1)
QW_PORT = int(QW_PORT)
RCON_PASSWORD = os.environ.get("RCON_PASSWORD", "")
SECRET = os.environ["FTB_SECRET"].encode()
DB_PATH = os.environ.get("FTB_DB", "/var/lib/ftebrazil/stats.db")
HTTP_PORT = int(os.environ.get("FTB_HTTP_PORT", "27600"))
POLL_SECONDS = float(os.environ.get("FTB_POLL", "3"))
MAPLIST_PATH = os.environ.get("FTB_MAPLIST", "")
FRAGLIMIT = int(os.environ.get("FTB_FRAGLIMIT", "100"))
TIMELIMIT_MIN = float(os.environ.get("FTB_TIMELIMIT", "20"))

OOB = b"\xff\xff\xff\xff"
NICK_RE = re.compile(r"^[A-Za-z0-9 _.\[\]-]{1,15}$")
COLOR_RE = re.compile(r"\^(?:[0-9a-zA-Z]|&[0-9A-Fa-f]{2})")
PLAYER_RE = re.compile(r'^(\d+) (-?\d+|S) (-?\d+) (-?\d+) "(.*?)" ')

db_lock = threading.Lock()
db = sqlite3.connect(DB_PATH, check_same_thread=False)
db.executescript("""
CREATE TABLE IF NOT EXISTS frags (nick TEXT NOT NULL, ts INTEGER NOT NULL, n INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS frags_ts ON frags (ts);
CREATE TABLE IF NOT EXISTS accounts (key TEXT PRIMARY KEY, nick TEXT NOT NULL,
  salt BLOB NOT NULL, hash BLOB NOT NULL, created INTEGER NOT NULL);
""")

online = []          # último snapshot de jogadores
current_map = ""     # mapa atual, lido via rcon
map_started = time.time()
changing_map_until = 0.0
last_frags = {}      # userid -> frags na última leitura
verified = {}        # userid -> nick já conferido


def plain_char(c):
    """Caractere do Quake (colorido, dourado ou U+E0xx do FTE) -> ASCII simples."""
    code = ord(c)
    if 0xE000 <= code <= 0xE0FF:
        code &= 0xFF
    if code > 0xFF:
        return c
    code &= 0x7F
    if code == 0x10:
        return "["
    if code == 0x11:
        return "]"
    if 0x12 <= code <= 0x1B:
        return chr(ord("0") + code - 0x12)
    return chr(code) if code >= 0x20 else ""


def plain_name(name):
    return "".join(plain_char(c) for c in name).strip()


def nick_key(name):
    """Nome do Quake -> chave estável (sem cor, sem caixa)."""
    return plain_name(name).lower()


def token_for(key):
    return hmac.new(SECRET, key.encode(), hashlib.sha256).hexdigest()[:24]


def hash_password(password, salt):
    return hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)


def udp(payload, timeout=1.0):
    """Manda um pacote OOB e junta as respostas até o timeout."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.settimeout(timeout)
        s.sendto(OOB + payload, (QW_HOST, QW_PORT))
        chunks = []
        try:
            while True:
                data, _ = s.recvfrom(65535)
                chunks.append(data[5:] if data.startswith(OOB) else data)
                s.settimeout(0.2)
        except socket.timeout:
            pass
    data = b"".join(chunks)
    try:
        return data.decode("utf-8")  # FTE manda nomes em UTF-8 (cores em U+E0xx)
    except UnicodeDecodeError:
        return data.decode("latin-1")  # clientes antigos: bit alto = colorido


def rcon(command):
    if not RCON_PASSWORD:
        return ""
    return udp(f"rcon {RCON_PASSWORD} {command}".encode("latin-1"))


def read_status():
    players = []
    for line in udp(b"status\n").splitlines():
        m = PLAYER_RE.match(line)
        if not m or m.group(2) == "S":
            continue
        userid, frags, minutes, ping, name = m.groups()
        frags = int(frags)
        if frags <= -9999 or name.startswith(("\\s\\", "BOT:")):
            continue  # espectador ou bot
        players.append({"userid": int(userid), "frags": frags, "minutes": int(minutes),
                        "ping": int(ping), "name": plain_name(name)})
    return players


def userinfo_token(userid):
    for line in rcon(f"user {userid}").splitlines():
        parts = COLOR_RE.sub("", line).split(None, 1)
        if parts and parts[0] == "_ftb":
            return parts[1].strip() if len(parts) > 1 else ""
    return ""


def enforce_nick(player):
    """Expulsa quem usa nick registrado sem o token certo."""
    key = nick_key(player["name"])
    if verified.get(player["userid"]) == key:
        return
    with db_lock:
        registered = db.execute("SELECT 1 FROM accounts WHERE key = ?", (key,)).fetchone()
    if not registered:
        verified[player["userid"]] = key
        return
    if not RCON_PASSWORD:
        return
    if hmac.compare_digest(userinfo_token(player["userid"]), token_for(key)):
        verified[player["userid"]] = key
    else:
        rcon(f"kick {player['userid']} Nick registrado. Entre pelo site com sua senha.")


def load_maplist():
    if not MAPLIST_PATH:
        return []
    try:
        with open(MAPLIST_PATH) as f:
            return [line.split("//")[0].strip().lower() for line in f if line.split("//")[0].strip()]
    except OSError:
        return []


def read_mapname():
    m = re.search(r'"host_mapname" is "([^"]*)"', COLOR_RE.sub("", rcon("host_mapname")))
    return m.group(1).lower() if m else ""


def rotate(players):
    """Troca de mapa ao bater o limite de frags ou de tempo (o progs fica sem limite)."""
    global current_map, map_started, changing_map_until
    maps = load_maplist()
    if not maps or not RCON_PASSWORD or time.time() < changing_map_until:
        return
    name = read_mapname()
    if not name:
        return
    if name != current_map:
        current_map, map_started = name, time.time()
    if name not in maps:
        target = maps[0]
    else:
        top = max(players, key=lambda p: p["frags"], default=None)
        hit_frags = top is not None and top["frags"] >= FRAGLIMIT
        hit_time = players and TIMELIMIT_MIN > 0 and time.time() - map_started >= TIMELIMIT_MIN * 60
        if not (hit_frags or hit_time):
            return
        target = maps[(maps.index(name) + 1) % len(maps)]
        if hit_frags:
            rcon(f"say {top['name']} venceu {name} com {top['frags']} frags! Proximo: {target}")
        else:
            rcon(f"say Tempo esgotado em {name}. Proximo: {target}")
    rcon(f"changelevel {target}")
    changing_map_until = time.time() + 15  # espera o mapa novo subir antes de olhar de novo


def poll_once():
    global online
    players = read_status()
    now = int(time.time())
    gained = []
    seen = set()
    for p in players:
        uid = p["userid"]
        seen.add(uid)
        try:
            enforce_nick(p)
        except OSError:
            pass
        prev = last_frags.get(uid)
        if prev is not None and p["frags"] > prev:
            gained.append((p["name"], now, p["frags"] - prev))
        last_frags[uid] = p["frags"]  # queda (troca de mapa, suicídio) só reposiciona
    for uid in list(last_frags):
        if uid not in seen:
            last_frags.pop(uid)
            verified.pop(uid, None)
    if gained:
        with db_lock, db:
            db.executemany("INSERT INTO frags (nick, ts, n) VALUES (?, ?, ?)", gained)
    online = [{"name": p["name"], "frags": p["frags"], "ping": p["ping"]} for p in players]
    rotate(players)


def poller():
    while True:
        try:
            poll_once()
        except OSError:
            pass
        time.sleep(POLL_SECONDS)


def ranking(days, limit=50):
    since = int(time.time()) - days * 86400 if days else 0
    with db_lock:
        rows = db.execute(
            "SELECT nick, SUM(n) AS total FROM frags WHERE ts >= ? GROUP BY lower(nick) "
            "ORDER BY total DESC LIMIT ?", (since, limit)).fetchall()
        registered = {k for (k,) in db.execute("SELECT key FROM accounts")}
    return [{"nick": n, "frags": t, "registered": nick_key(n) in registered} for n, t in rows]


class Api(BaseHTTPRequestHandler):
    server_version = "ftebrazil-stats"

    def send_json(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/ranking":
            period = parse_qs(url.query).get("period", ["week"])[0]
            days = {"day": 1, "week": 7, "month": 30, "all": 0}.get(period, 7)
            try:
                limit = max(1, min(int(parse_qs(url.query).get("limit", ["50"])[0]), 100))
            except ValueError:
                limit = 50
            return self.send_json(200, {"period": period, "players": ranking(days, limit)})
        if url.path == "/api/online":
            return self.send_json(200, {"players": online, "map": current_map, "fraglimit": FRAGLIMIT})
        self.send_json(404, {"error": "não encontrado"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > 4096:
            return self.send_json(413, {"error": "requisição grande demais"})
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
            nick = str(body.get("nick", "")).strip()
            password = str(body.get("password", ""))
        except (ValueError, AttributeError):
            return self.send_json(400, {"error": "JSON inválido"})
        if not NICK_RE.match(nick):
            return self.send_json(400, {"error": "Nick: até 15 letras, números, espaço ou . _ [ ] -"})
        if not 6 <= len(password) <= 128:
            return self.send_json(400, {"error": "A senha precisa ter pelo menos 6 caracteres"})
        key = nick_key(nick)

        if self.path == "/api/register":
            salt = secrets.token_bytes(16)
            try:
                with db_lock, db:
                    db.execute("INSERT INTO accounts (key, nick, salt, hash, created) VALUES (?, ?, ?, ?, ?)",
                               (key, nick, salt, hash_password(password, salt), int(time.time())))
            except sqlite3.IntegrityError:
                return self.send_json(409, {"error": "Esse nick já está registrado"})
            for uid, k in list(verified.items()):
                if k == key:
                    verified.pop(uid, None)  # quem já está jogando com o nick é conferido de novo
            return self.send_json(200, {"nick": nick, "token": token_for(key)})

        if self.path == "/api/login":
            with db_lock:
                row = db.execute("SELECT nick, salt, hash FROM accounts WHERE key = ?", (key,)).fetchone()
            if not row or not hmac.compare_digest(hash_password(password, row[1]), row[2]):
                time.sleep(1)  # freia tentativa de senha
                return self.send_json(401, {"error": "Nick ou senha incorretos"})
            return self.send_json(200, {"nick": row[0], "token": token_for(key)})

        self.send_json(404, {"error": "não encontrado"})

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    threading.Thread(target=poller, daemon=True).start()
    ThreadingHTTPServer(("127.0.0.1", HTTP_PORT), Api).serve_forever()
