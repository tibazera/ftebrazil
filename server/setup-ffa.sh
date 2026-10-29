#!/usr/bin/env bash
# Instala a rotação FFA Brasil no servidor FTE Brazil.
# Uso: ./setup-ffa.sh            (rode depois do install.sh e do deploy-site.sh)
#
# - extrai os .bsp de "FFA Maps BRASIL.rar" (raiz do repositório) em id1/maps;
# - usa o qwprogs.dat do nQuake (QWPROGS=/caminho para outro) para ter
#   deathmatch 3: armas nunca somem e itens/armaduras voltam;
# - cria id1/ffa.cfg com fraglimit 100 e a rotação via localinfo.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
QUAKE_DIR=/opt/ftebrazil
RAR="$REPO_DIR/FFA Maps BRASIL.rar"
MAPLIST="$REPO_DIR/server/maps/ffa-brasil.txt"
FRAGLIMIT="${FRAGLIMIT:-100}"
TIMELIMIT="${TIMELIMIT:-20}"

if [[ $EUID -ne 0 ]]; then echo "Rode como root" >&2; exit 1; fi
[[ -f "$RAR" ]] || { echo "Não achei $RAR (git pull na branch com o arquivo)" >&2; exit 1; }

apt-get install -y -qq libarchive-tools >/dev/null

echo "==> Mapas"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
bsdtar -xf "$RAR" -C "$TMP"
install -d -o quake -g quake "$QUAKE_DIR/id1/maps"
find "$TMP" -iname '*.bsp' -print0 | while IFS= read -r -d '' bsp; do
  name="$(basename "$bsp" | tr '[:upper:]' '[:lower:]')"
  install -m644 -o quake -g quake "$bsp" "$QUAKE_DIR/id1/maps/$name"
done

mapfile -t MAPS < <(sed 's|//.*||; s/[[:space:]]//g; /^$/d' "$MAPLIST")
for m in "${MAPS[@]}"; do
  [[ -f "$QUAKE_DIR/id1/maps/$m.bsp" ]] || { echo "Falta maps/$m.bsp" >&2; exit 1; }
done
echo "    ${#MAPS[@]} mapas na rotação"

echo "==> qwprogs.dat"
QWPROGS="${QWPROGS:-$(find /root/nquakesv /home -path '*/qw/qwprogs.dat' 2>/dev/null | head -n1 || true)}"
CFG="$QUAKE_DIR/id1/ffa.cfg"
{
  echo "// Gerado por server/setup-ffa.sh. Não edite: rode o script de novo."
  echo "fraglimit $FRAGLIMIT"
  echo "timelimit $TIMELIMIT"
  echo "samelevel 0"
  echo "allow_download 1"
  echo "allow_download_maps 1"
} > "$CFG"
if [[ -n "$QWPROGS" && -f "$QWPROGS" ]]; then
  install -m644 -o quake -g quake "$QWPROGS" "$QUAKE_DIR/id1/qwprogs.dat"
  echo "    usando $QWPROGS"
  {
    echo "sv_progs qwprogs"
    echo "deathmatch 3  // armas ficam no chão, itens e armaduras voltam"
    # Rotação nativa do QuakeWorld: ao fim de cada mapa vai para localinfo <mapa>.
    for i in "${!MAPS[@]}"; do
      echo "localinfo ${MAPS[$i]} ${MAPS[$(( (i + 1) % ${#MAPS[@]} ))]}"
    done
    echo "map ${MAPS[0]}"
  } >> "$CFG"
  sed -i '/^FTB_MAPLIST=/d' /etc/ftebrazil/stats.env 2>/dev/null || true
else
  echo "    qwprogs.dat não encontrado: deathmatch 2 (armas ficam) e rotação pelo ftebrazil-stats" >&2
  {
    echo "fraglimit 0  // quem troca de mapa é o ftebrazil-stats"
    echo "timelimit 0"
    echo "samelevel 1"
    echo "deathmatch 2"
    echo "map ${MAPS[0]}"
  } >> "$CFG"
  install -m644 "$MAPLIST" "$QUAKE_DIR/maplist.txt"
  if [[ -f /etc/ftebrazil/stats.env ]]; then
    sed -i '/^FTB_MAPLIST=/d; /^FTB_FRAGLIMIT=/d; /^FTB_TIMELIMIT=/d' /etc/ftebrazil/stats.env
    printf 'FTB_MAPLIST=%s\nFTB_FRAGLIMIT=%s\nFTB_TIMELIMIT=%s\n' "$QUAKE_DIR/maplist.txt" "$FRAGLIMIT" "$TIMELIMIT" >> /etc/ftebrazil/stats.env
  fi
fi
chown quake:quake "$CFG"

grep -q "exec ffa.cfg" "$QUAKE_DIR/id1/server.cfg" || echo "exec ffa.cfg" >> "$QUAKE_DIR/id1/server.cfg"
systemctl restart ftebrazil
systemctl restart ftebrazil-stats 2>/dev/null || true
echo "Pronto. Mapa inicial: ${MAPS[0]}  |  fraglimit $FRAGLIMIT  |  timelimit $TIMELIMIT min"
