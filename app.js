const form = document.querySelector('[data-join-form]');
const nameInput = document.querySelector('#player-name');
const passwordInput = document.querySelector('#player-password');
const registerBox = document.querySelector('[data-register]');
const note = document.querySelector('[data-form-note]');
const rankingList = document.querySelector('[data-ranking]');
const onlineLabel = document.querySelector('[data-online]');
const preview = document.querySelector('[data-nick-preview]');

const cleanPlayerName = value => value.replace(/[^A-Za-z0-9 _.\[\]-]/g, '').trim().slice(0, 15);

const store = {
  get: key => { try { return localStorage.getItem(key) || ''; } catch { return ''; } },
  set: (key, value) => { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch {} },
};

nameInput.value = store.get('ftebrazil_player_name');

// Estilo de cada letra do nick: 0 normal, 1 colorida (bit alto do Quake), 2 dourada.
// O FTE recebe o caractere do Quake N como U+E000+N.
let styles = [...store.get('ftebrazil_player_styles')].map(Number);
const canBeGold = ch => /[0-9\[\]]/.test(ch);

function quakeChar(ch, style) {
  if (style === 2 && canBeGold(ch)) {
    const code = ch === '[' ? 0x10 : ch === ']' ? 0x11 : 0x12 + Number(ch);
    return String.fromCharCode(0xe000 + code);
  }
  if (style === 1 && ch !== ' ') return String.fromCharCode(0xe080 + ch.charCodeAt(0));
  return ch;
}

const quakeName = name => [...name].map((ch, i) => quakeChar(ch, styles[i] || 0)).join('');

function renderPreview() {
  const name = cleanPlayerName(nameInput.value);
  styles = [...name].map((ch, i) => (styles[i] === 2 && !canBeGold(ch) ? 1 : styles[i] || 0));
  preview.replaceChildren(...[...name].map((ch, i) => {
    const letter = document.createElement('button');
    letter.type = 'button';
    letter.textContent = ch === ' ' ? '\u00a0' : ch;
    letter.className = ['', 'q-red', 'q-gold'][styles[i]];
    letter.title = 'Clique para mudar a cor';
    letter.addEventListener('click', () => {
      const max = canBeGold(ch) ? 3 : 2;
      styles[i] = (styles[i] + 1) % max;
      renderPreview();
    });
    return letter;
  }));
}

nameInput.addEventListener('input', renderPreview);
for (const button of document.querySelectorAll('[data-paint]')) {
  button.addEventListener('click', () => {
    styles = styles.map(() => Number(button.dataset.paint));
    renderPreview();
  });
}
document.querySelector('[data-wrap]').addEventListener('click', () => {
  const name = cleanPlayerName(nameInput.value).replace(/^\[|\]$/g, '').slice(0, 13);
  const inner = styles.slice(nameInput.value.startsWith('[') ? 1 : 0);
  nameInput.value = `[${name}]`;
  styles = [2, ...inner.slice(0, name.length), 2];
  renderPreview();
});
renderPreview();

function showError(message) {
  note.textContent = message;
  note.classList.add('error');
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || 'Servidor de contas indisponível'), { status: response.status });
  return data;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const name = cleanPlayerName(nameInput.value);
  if (nameInput.value && !name) {
    showError('Use letras, números, espaços ou . _ [ ] -');
    nameInput.focus();
    return;
  }
  nameInput.value = name;

  const password = passwordInput.value;
  // O token só vale para o nick em que foi emitido; trocar de nick sem senha descarta o antigo.
  if (store.get('ftebrazil_token_nick').toLowerCase() !== name.toLowerCase()) store.set('ftebrazil_token', '');

  if (password) {
    if (!name) {
      showError('Escolha um nick para usar senha.');
      return;
    }
    try {
      let account;
      try {
        account = await postJson(registerBox.checked ? 'api/register' : 'api/login', { nick: name, password });
      } catch (error) {
        // Nick já registrado com a caixa marcada: tenta entrar com a mesma senha.
        if (!registerBox.checked || error.status !== 409) throw error;
        account = await postJson('api/login', { nick: name, password });
      }
      store.set('ftebrazil_token', account.token);
      store.set('ftebrazil_token_nick', account.nick);
    } catch (error) {
      showError(error.message);
      return;
    }
  }

  store.set('ftebrazil_player_name', name);
  store.set('ftebrazil_player_styles', styles.join(''));
  location.href = `play/${name ? `?name=${encodeURIComponent(quakeName(name))}` : ''}`;
});

function renderRanking(players) {
  rankingList.replaceChildren();
  if (!players.length) {
    const empty = document.createElement('li');
    empty.className = 'ranking-empty';
    empty.textContent = 'Ninguém fez frag nesse período ainda. Seja o primeiro.';
    rankingList.append(empty);
    return;
  }
  for (const player of players) {
    const item = document.createElement('li');
    const nick = document.createElement('span');
    nick.className = 'nick';
    nick.textContent = player.nick;
    if (player.registered) {
      const mark = document.createElement('span');
      mark.className = 'verified';
      mark.textContent = '✓';
      mark.title = 'Nick registrado';
      nick.append(mark);
    }
    const frags = document.createElement('span');
    frags.className = 'frags';
    frags.textContent = `${player.frags} frags`;
    item.append(nick, frags);
    rankingList.append(item);
  }
}

async function loadRanking(period) {
  for (const button of document.querySelectorAll('[data-period]')) {
    button.setAttribute('aria-pressed', String(button.dataset.period === period));
  }
  try {
    const response = await fetch(`api/ranking?period=${period}&limit=20`);
    if (!response.ok) throw new Error();
    renderRanking((await response.json()).players);
  } catch {
    rankingList.innerHTML = '<li class="ranking-empty">Ranking indisponível no momento.</li>';
  }
}

async function loadOnline() {
  try {
    const response = await fetch('api/online');
    if (!response.ok) return;
    const { players } = await response.json();
    onlineLabel.textContent = players.length === 1
      ? '1 jogador na arena agora'
      : `${players.length} jogadores na arena agora`;
  } catch {}
}

for (const button of document.querySelectorAll('[data-period]')) {
  button.addEventListener('click', () => loadRanking(button.dataset.period));
}
loadRanking('week');
loadOnline();
setInterval(loadOnline, 15000);
