# Orientação para o Claude

## Objetivo do projeto

Transformar o FTE Brazil em uma experiência brasileira de QuakeWorld jogável no navegador, inspirada no fluxo do `q1.pieter.com`, mas sem copiar sua marca, textos, assets ou infraestrutura privada.

O caminho principal do usuário é:

1. abrir a landing page;
2. escolher um nome;
3. carregar o FTEQW WebAssembly;
4. conectar a um servidor brasileiro pelo navegador.

## Estado atual

Esta é uma base estática, sem framework e sem dependências:

- `index.html`, `styles.css`, `app.js`: landing page e entrada do jogador;
- `play/`: canvas e carregador do engine;
- `game/ftebrazil.fmf`: manifesto inicial no formato usado pelo FTEQW;
- `vendor/fte/`: `ftewebgl.js` e `ftewebgl.wasm`, gerados pelo workflow a partir de um commit fixo do FTEQW;
- `server/`: `server.cfg`, `Caddyfile` e guia do servidor brasileiro;
- `docs/architecture.md`: arquitetura e fases do projeto;
- `.github/workflows/pages.yml`: deploy estático no GitHub Pages.

O deploy compila o engine e o manifesto baixa o Quake shareware. Sem servidor configurado, `play/` abre o mapa `start` local. O servidor brasileiro roda em `wss://quake.qlash.com.br` (nginx + certbot na frente do `fteqw-sv`), já configurado em `DEFAULT_SERVER` no arquivo `play/play.js`.

## Primeira análise recomendada

Antes de editar:

1. leia `README.md`, `docs/architecture.md`, `play/play.js` e `game/ftebrazil.fmf`;
2. confirme como gerar o target web atual do repositório oficial `fte-team/fteqw`;
3. identifique os arquivos produzidos pelo build e como o `.wasm` é localizado pelo loader;
4. defina uma fonte legal para o conteúdo necessário ao primeiro mapa;
5. confirme o transporte suportado pelo servidor: WebSocket seguro ou WebRTC;
6. proponha a menor mudança que faça o engine abrir localmente antes de configurar multiplayer.

Não comece por ranking, notificações, contas ou backend. A prioridade é provar esta sequência:

```text
landing -> loader -> engine -> mapa local -> servidor brasileiro
```

## Restrições importantes

- FTEQW é GPL-2.0: qualquer binário publicado deve manter os avisos e disponibilizar o código-fonte correspondente.
- Não versionar conteúdo comercial de Quake, especialmente `pak1.pak`.
- Não copiar binários, scripts, imagens ou endpoints de `q1.pieter.com` sem licença explícita.
- Verificar separadamente as licenças de mapas, texturas, sons e pacotes.
- Não adicionar framework ou dependência enquanto HTML, CSS e JavaScript nativos forem suficientes.
- Manter o site funcional em GitHub Pages, incluindo caminhos relativos ao subdiretório `/ftebrazil/`.

## Como validar

```powershell
node --check app.js
node --check play/play.js
git diff --check
```

Para servir localmente, use qualquer servidor HTTP estático. Não abra os arquivos diretamente com `file://`, porque o WebAssembly e os downloads do manifesto exigem HTTP.

## Próximo marco

Entregar uma prova local que:

- carrega um build oficial ou reproduzível do FTEQW;
- encontra corretamente o arquivo `.wasm`;
- abre o menu ou um mapa cujo conteúdo possa ser redistribuído;
- documenta o comando de build e a origem de cada artefato;
- preserva a landing e o deploy estático existentes.

Depois disso, configurar um servidor FTEQW brasileiro e conectar o cliente usando um transporte aceito pelo navegador.
