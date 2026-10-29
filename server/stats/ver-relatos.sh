#!/usr/bin/env bash
# Lista os relatos enviados pela seção "Reportar problema" do site.
# Uso: ./ver-relatos.sh [quantidade]   (padrão: 20 mais recentes)
set -euo pipefail
DB=/var/lib/private/ftebrazil/stats.db
[[ -f $DB ]] || DB=/var/lib/ftebrazil/stats.db
python3 - "$DB" "${1:-20}" <<'PY'
import sqlite3, sys, time
con = sqlite3.connect(sys.argv[1])
rows = con.execute("SELECT id, ts, kind, nick, message, contact FROM reports ORDER BY id DESC LIMIT ?",
                   (int(sys.argv[2]),)).fetchall()
if not rows:
    print("Nenhum relato ainda.")
for id_, ts, kind, nick, message, contact in rows:
    when = time.strftime("%d/%m %H:%M", time.localtime(ts))
    print(f"#{id_}  {when}  [{kind}]  {nick or 'anônimo'}" + (f"  ({contact})" if contact else ""))
    print("    " + message.replace("\n", "\n    "))
PY
