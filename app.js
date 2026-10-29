const form = document.querySelector('[data-join-form]');
const nameInput = document.querySelector('#player-name');
const passwordInput = document.querySelector('#player-password');
const registerBox = document.querySelector('[data-register]');
const note = document.querySelector('[data-form-note]');
const rankingList = document.querySelector('[data-ranking]');
const onlineLabel = document.querySelector('[data-online]');

const cleanPlayerName = value => value.replace(/[^A-Za-z0-9 _.\[\]-]/g, '').trim().slice(0, 15);

const store = {
  get: key => { try { return localStorage.getItem(key) || ''; } catch { return ''; } },
  set: (key, value) => { try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch {} },
};

nameInput.value = store.get('ftebrazil_player_name');

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
  if (!response.ok) throw new Error(data.error || 'Servidor de contas indisponível');
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
      const account = await postJson(registerBox.checked ? 'api/register' : 'api/login', { nick: name, password });
      store.set('ftebrazil_token', account.token);
      store.set('ftebrazil_token_nick', account.nick);
    } catch (error) {
      showError(error.message);
      return;
    }
  }

  store.set('ftebrazil_player_name', name);
  location.href = `play/${name ? `?name=${encodeURIComponent(name)}` : ''}`;
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
    const response = await fetch(`api/ranking?period=${period}`);
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
