# Arquitetura inicial

## Objetivo

Levar uma pessoa da landing page para uma partida de QuakeWorld no navegador com o menor número de passos.

## Componentes

```text
Navegador
  ├─ Landing estática (GitHub Pages ou CDN)
  ├─ FTEQW WebAssembly + conteúdo permitido
  └─ WebSocket seguro / WebRTC
                    │
                    ▼
             Servidor FTEQW BR
```

A landing pode continuar estática. O servidor de jogo precisa aceitar uma conexão compatível com navegador; UDP puro não funciona a partir de uma página web.

## Fases

1. **Cliente local:** engine carrega, abre o menu e executa um mapa permitido.
2. **Multiplayer:** servidor brasileiro e transporte seguro conectam pelo manifesto.
3. **Comunidade:** status de jogadores e agenda de partidas.
4. **Competição:** ranking persistente e moderação de nomes.

## Limites legais

- Código do FTEQW: seguir GPL-2.0 e oferecer o código-fonte correspondente do binário publicado.
- Assets de Quake: não versionar conteúdo comercial.
- Site de referência: não copiar marca, textos, imagens, analytics ou infraestrutura privada.
