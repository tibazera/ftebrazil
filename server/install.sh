#!/usr/bin/env bash
# Instala o servidor FTE Brazil num Debian 12+ / Ubuntu 22.04+ limpo.
# Uso: sudo ./install.sh quake.seudominio.com.br
#
# O que faz: compila o fteqw-sv, baixa o Quake shareware, cria o serviço
# systemd "ftebrazil" e configura o Caddy para servir wss:// no domínio.
set -euo pipefail

DOMAIN="${1:-}"
FTEQW_REF="${FTEQW_REF:-f937b9d88f71fc4429db5fe56c6a98d922711b2e}"
SHAREWARE_URL="https://fte.triptohell.info/moodles/live/QUAKE_SW.zip"
QUAKE_USER="quake"
QUAKE_HOME="/opt/ftebrazil"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ $EUID -ne 0 ]]; then echo "Rode como root: sudo $0 <dominio>" >&2; exit 1; fi
if [[ -z "$DOMAIN" ]]; then echo "Uso: sudo $0 <dominio apontando para este servidor>" >&2; exit 1; fi

echo "==> Dependências"
apt-get update -qq
apt-get install -y -qq build-essential git curl unzip zlib1g-dev caddy

echo "==> Usuário $QUAKE_USER"
id "$QUAKE_USER" &>/dev/null || useradd --system --home "$QUAKE_HOME" --shell /usr/sbin/nologin "$QUAKE_USER"
mkdir -p "$QUAKE_HOME/id1"

echo "==> Compilando fteqw-sv ($FTEQW_REF)"
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT
git clone -q https://github.com/fte-team/fteqw.git "$BUILD_DIR/fteqw"
git -C "$BUILD_DIR/fteqw" checkout -q "$FTEQW_REF"
make -C "$BUILD_DIR/fteqw/engine" -j"$(nproc)" sv-rel
install -m755 "$(ls "$BUILD_DIR"/fteqw/engine/release/fteqw-sv* | head -n1)" /usr/local/bin/fteqw-sv

echo "==> Quake shareware"
if [[ ! -f "$QUAKE_HOME/id1/pak0.pak" ]]; then
  curl -fsSL -o "$BUILD_DIR/quake_sw.zip" "$SHAREWARE_URL"
  unzip -q "$BUILD_DIR/quake_sw.zip" -d "$BUILD_DIR/sw"
  PAK="$(find "$BUILD_DIR/sw" -iname pak0.pak | head -n1)"
  [[ -n "$PAK" ]] || { echo "pak0.pak não encontrado no zip" >&2; exit 1; }
  install -m644 "$PAK" "$QUAKE_HOME/id1/pak0.pak"
fi

echo "==> Configuração"
install -m644 "$SCRIPT_DIR/server.cfg" "$QUAKE_HOME/id1/server.cfg"
chown -R "$QUAKE_USER:$QUAKE_USER" "$QUAKE_HOME"

cat > /etc/systemd/system/ftebrazil.service <<UNIT
[Unit]
Description=FTE Brazil QuakeWorld server
After=network-online.target
Wants=network-online.target

[Service]
User=$QUAKE_USER
WorkingDirectory=$QUAKE_HOME
ExecStart=/usr/local/bin/fteqw-sv -basedir $QUAKE_HOME +exec server.cfg
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=$QUAKE_HOME

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
	reverse_proxy 127.0.0.1:27500
}
CADDY

echo "==> Firewall"
if command -v ufw &>/dev/null && ufw status | grep -q active; then
  ufw allow 80/tcp; ufw allow 443/tcp; ufw allow 27500/udp
fi

systemctl daemon-reload
systemctl enable --now ftebrazil
systemctl restart ftebrazil
systemctl reload caddy || systemctl restart caddy

echo
echo "Pronto. Navegador: wss://$DOMAIN  |  Desktop: connect $DOMAIN:27500"
echo "Logs: journalctl -u ftebrazil -f"
echo "Libere 80/tcp, 443/tcp e 27500/udp também no painel do provedor."
