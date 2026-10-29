# Changelog

Todas as mudanças relevantes do FTE Brazil. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); datas no fuso de Brasília.

## [Não lançado]

### Adicionado
- Janela "Ao vivo" na página inicial: mapa atual e quem está jogando agora
  (nick, frags e ping), atualizada a cada 5 segundos, com botão para assistir.
- Login lembrado: depois de entrar com nick e senha, o site mostra "Conectado como
  <nick>" e não pede a senha de novo neste navegador; botão "Sair" esquece a chave.
  No Chrome/Edge, o navegador também oferece salvar a senha.

### Corrigido
- Tela preta no navegador: a página do jogo agora explica o motivo (navegador sem
  WebGL, erro ao carregar o engine ou placa de vídeo que parou de responder) e
  sugere o que fazer, em vez de ficar em branco.

## [0.2.0] - 2026-10-29

### Adicionado
- Site traduzido para inglês e espanhol, com botões PT / EN / ES no topo; a
  escolha fica salva e vale também na página do jogo (`i18n.js`).
- Seção "Reportar problema": relatos gravados no servidor
  (`server/stats/ver-relatos.sh`) e, opcionalmente, enviados a um webhook do Discord.
- Botão "Assistir ao vivo": entra como espectador, sem ocupar vaga nem contar no ranking.
- Convite do Discord da comunidade Sul-Americana de QuakeWorld no topo, abaixo do
  formulário e em seção própria.
- Rotação FFA Brasil (`server/setup-ffa.sh`): 26 mapas de `FFA Maps BRASIL.rar`,
  fraglimit 100, timelimit 20, deathmatch 3 (armas nunca somem) com o
  `qwprogs.dat` GPL da id Software.
- Mapas baixados por HTTPS do próprio site (`sv_dlURL`), sem passar pela conexão do jogo.
- Ranking de frags (top 20: hoje, semana, geral) ao lado do formulário e contador
  de jogadores online (`server/stats/ftebrazil_stats.py`).
- Registro de nick com senha; quem usa nick registrado sem a chave é expulso via rcon.
  Script para apagar registro: `server/stats/remover-nick.sh`.
- Botão "Sair da arena" (aparece com ESC) e `quit` do jogo voltando ao site.

### Alterado
- O nick não vai mais na URL de `play/`: link compartilhado não leva o nick de
  ninguém, e nick registrado sem a chave volta para o login antes de conectar.
- Cliente web sem vsync, limitado a 120 fps.

### Corrigido
- Letras digitadas saíam duplicadas no console do jogo (canvas com foco).
- Tela de carregamento ficava por cima do jogo já rodando.
- `fteqw-sv` caía com "Out of memory" em VPS pequeno (`pr_maxedicts`).
- Instalação com nginx já existente na máquina (sem Caddy).

### Removido
- Editor de cores do nick (estilo Quake).

## [0.1.0] - 2026-10-28

### Adicionado
- Landing page, carregador `play/` e manifesto `game/ftebrazil.fmf` com o Quake shareware.
- Build do FTEQW web no GitHub Actions a partir de um commit fixo (GPL-2.0, com
  `LICENSE-FTEQW.txt` e `SOURCE.txt`).
- Servidor brasileiro: `server/install.sh` (fteqw-sv + systemd) e
  `server/deploy-site.sh` (engine web compilado no VPS, nginx com WebSocket e HTTPS).
