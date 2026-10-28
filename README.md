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
game/               manifesto e futura configuração do jogo
vendor/fte/         binários WebAssembly não versionados nesta etapa
docs/               decisões e próximos passos
```

## Para ficar jogável

1. Gerar ou obter de fonte oficial o build WebAssembly do FTEQW.
2. Definir conteúdo permitido: Quake shareware ou pacote livre compatível.
3. Subir um servidor FTEQW brasileiro com WebSocket seguro ou WebRTC.
4. Apontar o manifesto para os pacotes e para o servidor.

O ranking, a lista de jogadores e as notificações dependem de um backend e entram depois da conexão básica funcionar.

## Créditos e licenças

O engine [FTEQW](https://github.com/fte-team/fteqw) é distribuído sob GPL-2.0. Quake e QuakeWorld são marcas de seus respectivos proprietários. Verifique separadamente a licença de todo mapa, textura, som e pacote antes de publicar.
