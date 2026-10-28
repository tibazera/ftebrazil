const canvas = document.querySelector('#canvas');
const loader = document.querySelector('#loader');
const status = document.querySelector('#status');
const progress = document.querySelector('#progress');
const playerName = new URLSearchParams(location.search).get('name')?.replace(/[^A-Za-z0-9 _.\[\]-]/g, '').trim().slice(0, 15);

window.Module = {
  canvas,
  arguments: [
    '-manifest', '../game/ftebrazil.fmf',
    '+set', 'vid_hardwaregamma', '2',
    '+set', 'gamma', '1.05',
    ...(playerName ? ['+set', 'name', playerName] : []),
  ],
  print: console.log,
  printErr: console.error,
  setStatus(message) {
    status.textContent = message || 'Entrando na arena…';
    const match = message.match(/\((\d+(?:\.\d+)?)\/(\d+)\)/);
    progress.hidden = !match;
    if (match) progress.value = Number(match[1]) / Number(match[2]) * 100;
  },
  postRun: [() => {
    loader.hidden = true;
    canvas.style.display = 'block';
    canvas.focus();
  }],
};

const engine = document.createElement('script');
engine.src = '../vendor/fte/ftewebgl.js';
engine.onerror = () => {
  status.textContent = 'Cliente FTEQW ainda não instalado.';
  document.querySelector('.spinner').hidden = true;
};
document.head.append(engine);
