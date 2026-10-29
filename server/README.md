# Servidor brasileiro

O navegador não fala UDP. O cliente web conecta por `wss://`, o Caddy cuida do
certificado TLS e repassa o WebSocket para a porta TCP do `fteqw-sv`. Clientes
desktop continuam entrando por UDP na porta 27500.

```text
navegador ──wss:443──> Caddy ──ws──> fteqw-sv :27500/tcp
desktop   ──────────udp 27500──────> fteqw-sv
```

## Instalação automática

Num Debian 12+ ou Ubuntu 22.04+ com o domínio já apontando para o IP:

```bash
git clone https://github.com/tibazera/ftebrazil.git
cd ftebrazil/server
sudo ./install.sh quake.seudominio.com.br
```

O script faz os passos abaixo: compila o `fteqw-sv`, baixa o shareware, cria o
serviço `ftebrazil` no systemd e configura o Caddy. Os passos manuais seguem
para referência.

## Site no mesmo domínio

Para servir também o site em `https://<dominio>` (em vez do GitHub Pages):

```bash
./deploy-site.sh quake.seudominio.com.br
```

Na primeira vez instala o Emscripten e compila o engine web (demora alguns
minutos). Depois de cada `git pull`, rode de novo para atualizar o site. O nginx
manda requisições de WebSocket para o `fteqw-sv` e o resto para os arquivos.

## Ranking e nicks registrados

O `deploy-site.sh` também instala o serviço `ftebrazil-stats`
(`server/stats/ftebrazil_stats.py`, só Python padrão):

- consulta o `fteqw-sv` a cada 3 s e soma os frags de cada nick em
  `/var/lib/ftebrazil/stats.db`;
- expõe `/api/ranking?period=day|week|all`, `/api/online`, `/api/register` e
  `/api/login` pelo nginx;
- nick registrado ganha um token que o site envia ao jogo (`setinfo _ftb`);
  quem entra com nick registrado sem o token é expulso via rcon.

Segredos ficam em `/etc/ftebrazil/stats.env` (gerado uma vez). Logs:
`journalctl -u ftebrazil-stats -f`.

## Rotação FFA Brasil

```bash
./setup-ffa.sh
```

Extrai os mapas de `FFA Maps BRASIL.rar` para `/opt/ftebrazil/id1/maps`, gera
`id1/ffa.cfg` (fraglimit 100, timelimit 20) com a ordem de
`server/maps/ffa-brasil.txt` e reinicia o servidor. Baixa o `qwprogs.dat` oficial do QuakeWorld
(id-Software/Quake, GPL, conferido por sha256) só para `/opt/ftebrazil`: roda em
deathmatch 3, com armas que nunca somem, e a rotação é nativa (`localinfo`). Se o
download falhar, o `ftebrazil-stats` faz a troca de mapa. Para mudar os limites: `FRAGLIMIT=50 TIMELIMIT=15 ./setup-ffa.sh`.

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
# https://fte.triptohell.info/qsw106.zip
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
