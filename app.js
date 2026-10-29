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

const sessionBox = document.querySelector('[data-session]');
const passwordFields = document.querySelector('[data-password-fields]');

// Com a chave do nick salva neste navegador, não precisa digitar a senha de novo.
function syncSession() {
  const name = cleanPlayerName(nameInput.value);
  const tokenNick = store.get('ftebrazil_token_nick');
  const logged = !!store.get('ftebrazil_token') && !!name && tokenNick.toLowerCase() === name.toLowerCase();
  sessionBox.hidden = !logged;
  passwordFields.hidden = logged;
  if (logged) sessionBox.querySelector('[data-session-nick]').textContent = tokenNick;
}

nameInput.addEventListener('input', syncSession);
document.querySelector('[data-logout]').addEventListener('click', () => {
  store.set('ftebrazil_token', '');
  store.set('ftebrazil_token_nick', '');
  passwordInput.value = '';
  syncSession();
  passwordInput.focus();
});
syncSession();

// Oferece salvar a senha no gerenciador do navegador (Chrome/Edge).
async function offerToSavePassword(nick, password) {
  if (!window.PasswordCredential || !navigator.credentials?.store) return;
  try {
    await navigator.credentials.store(new PasswordCredential({ id: nick, password, name: nick }));
  } catch {}
}

if (new URLSearchParams(location.search).get('login') === '1') {
  note.textContent = t('err.login_required');
  note.classList.add('error');
  passwordInput.focus();
}

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
  if (!response.ok) throw Object.assign(new Error(data.error ? tApi(data.error) : t('err.accounts')), { status: response.status });
  return data;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const name = cleanPlayerName(nameInput.value);
  if (nameInput.value && !name) {
    showError(t('err.name'));
    nameInput.focus();
    return;
  }
  nameInput.value = name;

  const password = passwordInput.value;
  // O token só vale para o nick em que foi emitido; trocar de nick sem senha descarta o antigo.
  if (store.get('ftebrazil_token_nick').toLowerCase() !== name.toLowerCase()) store.set('ftebrazil_token', '');

  if (password) {
    if (!name) {
      showError(t('err.password_nick'));
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
      await offerToSavePassword(account.nick, password);
    } catch (error) {
      showError(error.message);
      return;
    }
  }

  store.set('ftebrazil_player_name', name);
  // O nick não vai na URL: um link compartilhado não leva o nick de ninguém.
  location.href = 'play/';
});

function renderRanking(players) {
  rankingList.replaceChildren();
  if (!players.length) {
    const empty = document.createElement('li');
    empty.className = 'ranking-empty';
    empty.textContent = t('rank.empty');
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
      mark.title = t('rank.mark');
      nick.append(mark);
    }
    const frags = document.createElement('span');
    frags.className = 'frags';
    frags.textContent = `${player.frags} frags`;
    item.append(nick, frags);
    rankingList.append(item);
  }
}

let currentPeriod = 'week';

async function loadRanking(period) {
  currentPeriod = period;
  for (const button of document.querySelectorAll('[data-period]')) {
    button.setAttribute('aria-pressed', String(button.dataset.period === period));
  }
  try {
    const response = await fetch(`api/ranking?period=${period}&limit=20`);
    if (!response.ok) throw new Error();
    renderRanking((await response.json()).players);
  } catch {
    const item = document.createElement('li');
    item.className = 'ranking-empty';
    item.textContent = t('rank.error');
    rankingList.replaceChildren(item);
  }
}

const liveList = document.querySelector('[data-live-list]');
const liveMap = document.querySelector('[data-live-map]');

function renderLive(players, map) {
  liveMap.textContent = map ? map.toUpperCase() : '—';
  liveList.replaceChildren();
  if (!players.length) {
    const empty = document.createElement('li');
    empty.className = 'live-empty';
    empty.textContent = t('live.empty');
    liveList.append(empty);
    return;
  }
  for (const player of [...players].sort((a, b) => b.frags - a.frags)) {
    const item = document.createElement('li');
    const nick = document.createElement('span');
    nick.className = 'nick';
    nick.textContent = player.name;
    const frags = document.createElement('span');
    frags.className = 'frags';
    frags.textContent = player.frags;
    const ping = document.createElement('span');
    ping.className = 'ping';
    ping.textContent = `${player.ping} ms`;
    item.append(nick, frags, ping);
    liveList.append(item);
  }
}

async function loadOnline() {
  try {
    const response = await fetch('api/online');
    if (!response.ok) throw new Error();
    const { players, map } = await response.json();
    renderLive(players, map);
    onlineLabel.textContent = players.length === 1
      ? t('online.one')
      : t('online.many', { n: players.length });
  } catch {
    const item = document.createElement('li');
    item.className = 'live-empty';
    item.textContent = t('live.error');
    liveList.replaceChildren(item);
  }
}

for (const button of document.querySelectorAll('[data-period]')) {
  button.addEventListener('click', () => loadRanking(button.dataset.period));
}
loadRanking('week');
// Ao trocar de idioma, refaz os textos montados por JS.
document.addEventListener('languagechange', () => {
  if (!note.classList.contains('error')) note.textContent = t('join.note');
  loadRanking(currentPeriod);
  loadOnline();
});
loadOnline();
setInterval(loadOnline, 5000);

const reportForm = document.querySelector('[data-report-form]');
const reportNote = document.querySelector('[data-report-note]');
reportForm.nick.value = store.get('ftebrazil_player_name');

reportForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = reportForm.querySelector('button');
  button.disabled = true;
  reportNote.className = 'field-note';
  reportNote.textContent = t('report.sending');
  try {
    await postJson('api/report', {
      kind: reportForm.kind.value,
      nick: reportForm.nick.value,
      message: reportForm.message.value,
      contact: reportForm.contact.value,
      agent: navigator.userAgent,
    });
    reportForm.message.value = '';
    reportNote.classList.add('ok');
    reportNote.textContent = t('report.sent');
  } catch (error) {
    reportNote.classList.add('error');
    reportNote.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
