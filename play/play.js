const canvas = document.querySelector('#canvas');
const loader = document.querySelector('#loader');
const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
// Endereço do servidor brasileiro (wss://...). Vazio = mapa local para testar o engine.
// Também aceita ?server=wss://... na URL para testes.
const DEFAULT_SERVER = 'wss://quake.qlash.com.br';
const params = new URLSearchParams(location.search);
const server = (params.get('server') || DEFAULT_SERVER).trim();
let token = '';
try { token = localStorage.getItem('ftebrazil_token') || ''; } catch {}
const playerName = params.get('name')?.replace(/[^A-Za-z0-9 _.\[\]\-\ue000-\ue0ff]/g, '').trim().slice(0, 15);

const exitLink = document.querySelector('#exit');

function showGame() {
  loader.hidden = true;
  canvas.focus();
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
    // Chave com "_" fica só no servidor; o serviço de ranking confere o token do nick registrado.
    ...(/^[0-9a-f]{24}$/.test(token) ? ['+setinfo', '_ftb', token] : []),
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

const engine = document.createElement('script');
engine.src = '../vendor/fte/ftewebgl.js';
engine.onerror = () => {
  status.textContent = 'Cliente FTEQW ainda não instalado.';
  document.querySelector('.spinner').hidden = true;
};
document.head.append(engine);
