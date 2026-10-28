# Servidor brasileiro

O navegador não fala UDP. O cliente web conecta por `wss://`, o Caddy cuida do
certificado TLS e repassa o WebSocket para a porta TCP do `fteqw-sv`. Clientes
desktop continuam entrando por UDP na porta 27500.

```text
navegador ──wss:443──> Caddy ──ws──> fteqw-sv :27500/tcp
desktop   ──────────udp 27500──────> fteqw-sv
```

## 1. VPS

Qualquer Linux em São Paulo serve (Vultr, AWS `sa-east-1`, Oracle Cloud, Magalu
Cloud). 1 vCPU e 1 GB de RAM sobram para 16 jogadores. Libere `443/tcp` e
`27500/udp` no firewall e aponte um domínio (registro A) para o IP.

## 2. Engine do servidor

```bash
sudo apt install -y build-essential git zlib1g-dev
git clone https://github.com/fte-team/fteqw.git
cd fteqw/engine
make -j"$(nproc)" sv-rel
sudo install -m755 release/fteqw-sv* /usr/local/bin/fteqw-sv
```

## 3. Conteúdo e configuração

```bash
mkdir -p ~/quake/id1
# pak0.pak do Quake shareware (episódio 1), o mesmo que o cliente web baixa:
# https://fte.triptohell.info/moodles/live/QUAKE_SW.zip
cp server.cfg ~/quake/id1/
cd ~/quake && fteqw-sv -basedir ~/quake +exec server.cfg
```

Para rodar sempre, crie um serviço `systemd` com esse comando.

## 4. TLS com Caddy

```bash
sudo apt install -y caddy
sudo cp Caddyfile /etc/caddy/Caddyfile   # edite o domínio antes
sudo systemctl reload caddy
```

## 5. Ligar o site ao servidor

Teste com `play/?server=wss://quake.seudominio.com.br`. Quando funcionar, fixe o
endereço em `DEFAULT_SERVER` no arquivo `play/play.js`.
