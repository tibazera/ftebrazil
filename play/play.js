const canvas = document.querySelector('#canvas');
const loader = document.querySelector('#loader');
const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
// Endereço do servidor brasileiro (wss://...). Vazio = mapa local para testar o engine.
// Também aceita ?server=wss://... na URL para testes.
const DEFAULT_SERVER = 'wss://quake.qlash.com.br';
const params = new URLSearchParams(location.search);
const server = (params.get('server') || DEFAULT_SERVER).trim();
const playerName = params.get('name')?.replace(/[^A-Za-z0-9 _.\[\]-]/g, '').trim().slice(0, 15);

function showGame() {
  loader.hidden = true;
  canvas.focus();
}

window.Module = {
  canvas,
  arguments: [
    '-manifest', '../game/ftebrazil.fmf',
    '+set', 'vid_hardwaregamma', '2',
    '+set', 'gamma', '1.05',
    '+bind', 'w', '+forward',
    '+bind', 's', '+back',
    '+bind', 'a', '+moveleft',
    '+bind', 'd', '+moveright',
    '+bind', 'mouse2', '+jump',
    ...(playerName ? ['+set', 'name', playerName] : []),
    ...(/^wss?:\/\//.test(server) ? ['+connect', server] : ['+map', 'start']),
  ],
  print: console.log,
  printErr: console.error,
  setStatus(message) {
    // O Emscripten chama setStatus('') quando todos os downloads terminam.
    if (!message) return showGame();
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
