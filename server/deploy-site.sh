#!/usr/bin/env bash
# Publica o site FTE Brazil no próprio VPS, no mesmo domínio do servidor de jogo.
# Uso: ./deploy-site.sh quake.seudominio.com.br
#
# Compila o FTEQW web (na primeira vez instala o Emscripten em /opt/emsdk),
# copia o site para /var/www/ftebrazil e configura o nginx para:
#   - requisições normais  -> arquivos do site
#   - upgrade de WebSocket -> fteqw-sv (127.0.0.1:27500)
# Rode de novo depois de cada "git pull" para atualizar o site.
set -euo pipefail

DOMAIN="${1:-}"
FTEQW_REF="${FTEQW_REF:-f937b9d88f71fc4429db5fe56c6a98d922711b2e}"
EMSDK_VERSION="2.0.12"
EMSDK_DIR="/opt/emsdk"
WEB_ROOT="/var/www/ftebrazil"
ENGINE_CACHE="/opt/ftebrazil-web/$FTEQW_REF"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ $EUID -ne 0 ]]; then echo "Rode como root" >&2; exit 1; fi
if [[ -z "$DOMAIN" ]]; then echo "Uso: $0 <dominio>" >&2; exit 1; fi

apt-get install -y -qq git python3 xz-utils make rsync nginx >/dev/null

if [[ ! -f "$ENGINE_CACHE/ftewebgl.wasm" ]]; then
  echo "==> Emscripten $EMSDK_VERSION"
  [[ -d "$EMSDK_DIR" ]] || git clone -q https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
  "$EMSDK_DIR/emsdk" install "$EMSDK_VERSION"
  "$EMSDK_DIR/emsdk" activate "$EMSDK_VERSION" >/dev/null
  # shellcheck disable=SC1091
  source "$EMSDK_DIR/emsdk_env.sh" >/dev/null

  echo "==> Compilando FTEQW web ($FTEQW_REF)"
  BUILD_DIR="$(mktemp -d)"
  trap 'rm -rf "$BUILD_DIR"' EXIT
  git clone -q https://github.com/fte-team/fteqw.git "$BUILD_DIR/fteqw"
  git -C "$BUILD_DIR/fteqw" checkout -q "$FTEQW_REF"
  make -C "$BUILD_DIR/fteqw/engine" FTE_TARGET=web makelibs
  make -C "$BUILD_DIR/fteqw/engine" -j"$(nproc)" FTE_TARGET=web gl-rel
  mkdir -p "$ENGINE_CACHE"
  cp "$BUILD_DIR"/fteqw/engine/release/ftewebgl.{js,wasm} "$ENGINE_CACHE/"
  cp "$BUILD_DIR/fteqw/LICENSE" "$ENGINE_CACHE/LICENSE-FTEQW.txt"
  cat > "$ENGINE_CACHE/SOURCE.txt" <<SRC
ftewebgl.js / ftewebgl.wasm (GPL-2.0)
Fonte: https://github.com/fte-team/fteqw/tree/$FTEQW_REF
Build: make FTE_TARGET=web makelibs && make FTE_TARGET=web gl-rel
Emscripten: $EMSDK_VERSION
SRC
else
  echo "==> Engine web já compilado para $FTEQW_REF"
fi

echo "==> Publicando site em $WEB_ROOT"
mkdir -p "$WEB_ROOT"
rsync -a --delete --exclude .git --exclude .github --exclude server "$REPO_DIR/" "$WEB_ROOT/"
cp "$ENGINE_CACHE"/* "$WEB_ROOT/vendor/fte/"

echo "==> nginx"
CERT="/etc/letsencrypt/live/$DOMAIN"
if [[ -f "$CERT/fullchain.pem" ]]; then
  LISTEN="listen 443 ssl;
    ssl_certificate $CERT/fullchain.pem;
    ssl_certificate_key $CERT/privkey.pem;"
  REDIRECT="server { listen 80; server_name $DOMAIN; return 301 https://\$host\$request_uri; }"
else
  LISTEN="listen 80;"
  REDIRECT=""
fi
cat > /etc/nginx/sites-available/ftebrazil <<NGINX
$REDIRECT
server {
    $LISTEN
    server_name $DOMAIN;
    root $WEB_ROOT;
    index index.html;

    gzip on;
    gzip_types application/javascript application/wasm text/css;

    location / {
        # O cliente do jogo abre wss://$DOMAIN; o resto é o site.
        if (\$http_upgrade ~* websocket) {
            proxy_pass http://127.0.0.1:27500;
        }
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 1h;
        try_files \$uri \$uri/ =404;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/ftebrazil /etc/nginx/sites-enabled/ftebrazil
nginx -t
systemctl reload nginx

if [[ ! -f "$CERT/fullchain.pem" ]]; then
  echo "Sem certificado ainda. Rode: certbot --nginx -d $DOMAIN  (e depois este script de novo)"
fi
echo "Pronto: https://$DOMAIN"
