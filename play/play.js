const canvas = document.querySelector('#canvas');
const loader = document.querySelector('#loader');
const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
// Endereço do servidor brasileiro (wss://...). Vazio = mapa local para testar o engine.
// Também aceita ?server=wss://... na URL para testes.
const DEFAULT_SERVER = 'wss://quake.qlash.com.br';
const params = new URLSearchParams(location.search);
const spectate = params.get('spectate') === '1';
const server = (params.get('server') || DEFAULT_SERVER).trim();
const storage = key => { try { return localStorage.getItem(key) || ''; } catch { return ''; } };
const token = storage('ftebrazil_token');
// O nick vem do que a pessoa digitou neste navegador, nunca da URL.
const playerName = storage('ftebrazil_player_name').replace(/[^A-Za-z0-9 _.\[\]-]/g, '').trim().slice(0, 15);

const exitLink = document.querySelector('#exit');

function showGame() {
  loader.hidden = true;
  // O FTE escuta teclas no document e no canvas: se o canvas tiver foco, cada tecla
  // chega duas vezes. Sem tabindex o canvas não recebe foco e o document trata sozinho.
  document.activeElement?.blur();
  syncExit();
}

// Com o mouse preso no jogo o botão some; ESC solta o mouse e o botão volta.
function syncExit() {
  exitLink.hidden = !loader.hidden || document.pointerLockElement === canvas;
}
document.addEventListener('pointerlockchange', syncExit);

window.Module = {
  canvas,
  // "quit" no menu do jogo volta para o site em vez de fechar a aba.
  quiturl: '../',
  arguments: [
    '-manifest', '../game/ftebrazil.fmf',
    // Sem vsync o FTE agenda frames com setTimeout em vez de requestAnimationFrame,
    // que prende o jogo na taxa do monitor; cl_maxfps segura em 120.
    '+set', 'vid_vsync', '0',
    '+set', 'cl_maxfps', '120',
    '+bind', 'w', '+forward',
    '+bind', 's', '+back',
    '+bind', 'a', '+moveleft',
    '+bind', 'd', '+moveright',
    '+bind', 'mouse2', '+jump',
    ...(playerName ? ['+set', 'name', playerName] : []),
    // Espectador: entra no servidor só para assistir (não ocupa vaga nem conta no ranking).
    '+setinfo', 'spectator', spectate ? '1' : '0',
    // Chave com "_" fica só no servidor; o serviço de ranking confere o token do nick registrado.
    // Só o servidor oficial recebe a chave: um ?server= de terceiros não pode capturá-la.
    ...(/^[0-9a-f]{24}$/.test(token) && server === DEFAULT_SERVER ? ['+setinfo', '_ftb', token] : []),
    ...(/^wss?:\/\//.test(server) ? ['+connect', server] : ['+map', 'start']),
  ],
  print: console.log,
  printErr: console.error,
  setStatus(message) {
    // 'Running...' (e depois '') é o último status do Emscripten antes do jogo começar.
    if (!message || message.startsWith('Running')) return showGame();
    status.textContent = message;
    const match = message.match(/\((\d+(?:\.\d+)?)\/(\d+)\)/);
    progress.hidden = !match;
    if (match) progress.value = Number(match[1]) / Number(match[2]) * 100;
  },
  postRun: [showGame],
};

// Nick registrado sem a chave deste navegador volta para o login antes de conectar.
async function nickAllowed() {
  if (!playerName || spectate) return true;
  if (/^[0-9a-f]{24}$/.test(token) && storage('ftebrazil_token_nick').toLowerCase() === playerName.toLowerCase()) return true;
  try {
    const response = await fetch(`../api/nick?nick=${encodeURIComponent(playerName)}`);
    return !response.ok || !(await response.json()).registered;
  } catch {
    return true; // sem API (ex.: GitHub Pages): o servidor ainda expulsa quem não tiver a chave
  }
}

const engine = document.createElement('script');
engine.src = '../vendor/fte/ftewebgl.js';
engine.onerror = () => {
  status.textContent = 'Cliente FTEQW ainda não instalado.';
  document.querySelector('.spinner').hidden = true;
};
nickAllowed().then(allowed => {
  if (allowed) document.head.append(engine);
  else location.replace('../?login=1');
});
