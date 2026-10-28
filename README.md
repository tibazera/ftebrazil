# FTE Brazil

QuakeWorld no navegador para a comunidade brasileira. Projeto comunitário, não comercial e não afiliado à id Software ou à ZeniMax Media.

## O que já existe

- landing page responsiva em português;
- nome do jogador salvo localmente;
- carregador preparado para o cliente FTEQW/WebAssembly;
- manifesto inicial do jogo;
- deploy estático no GitHub Pages.

## Rodar localmente

O site não tem build nem dependências:

```powershell
python -m http.server 8080
```

Abra `http://localhost:8080`. Para a arena funcionar, instale primeiro o build do FTEQW conforme [`vendor/fte/README.md`](vendor/fte/README.md).

## Arquitetura

```text
index.html          landing page
styles.css          identidade e layout
app.js              entrada e persistência do nome
play/               canvas e carregador do engine
game/               manifesto do jogo (conteúdo shareware)
server/             configuração do servidor brasileiro e do proxy TLS
vendor/fte/         binários WebAssembly não versionados nesta etapa
docs/               decisões e próximos passos
```

## Para ficar jogável

1. **Engine:** o workflow do Pages compila o FTEQW web a partir de um commit fixo do repositório oficial ([`vendor/fte/README.md`](vendor/fte/README.md)).
2. **Conteúdo:** o manifesto baixa o zip oficial do Quake shareware e usa só o `pak0.pak` (episódio 1).
3. **Teste local:** sem servidor configurado, `play/` abre o mapa `start` localmente.
4. **Servidor BR:** `fteqw-sv` com WebSocket atrás do Caddy (`wss://`), conforme [`server/README.md`](server/README.md). Depois, preencha `DEFAULT_SERVER` em `play/play.js` ou teste com `play/?server=wss://...`.

O ranking, a lista de jogadores e as notificações dependem de um backend e entram depois da conexão básica funcionar.

## Créditos e licenças

O engine [FTEQW](https://github.com/fte-team/fteqw) é distribuído sob GPL-2.0. Quake e QuakeWorld são marcas de seus respectivos proprietários. Verifique separadamente a licença de todo mapa, textura, som e pacote antes de publicar.
