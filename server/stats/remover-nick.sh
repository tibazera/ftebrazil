#!/usr/bin/env bash
# Apaga o registro (senha) de um nick para ele poder ser registrado de novo.
# Os frags do nick no ranking continuam. Uso: ./remover-nick.sh <nick>
set -euo pipefail
NICK="${1:?Uso: $0 <nick>}"
DB=/var/lib/private/ftebrazil/stats.db
[[ -f $DB ]] || DB=/var/lib/ftebrazil/stats.db
python3 - "$DB" "$NICK" <<'PY'
import sqlite3, sys
db, nick = sys.argv[1], sys.argv[2]
key = "".join(chr(ord(c) & 0x7F) for c in nick).strip().lower()
con = sqlite3.connect(db)
n = con.execute("DELETE FROM accounts WHERE key = ?", (key,)).rowcount
con.commit()
print(f"Registro de '{nick}' removido." if n else f"'{nick}' não estava registrado.")
PY
