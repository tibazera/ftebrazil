const form = document.querySelector('[data-join-form]');
const nameInput = document.querySelector('#player-name');
const note = document.querySelector('[data-form-note]');

const cleanPlayerName = value => value.replace(/[^A-Za-z0-9 _.\[\]-]/g, '').trim().slice(0, 15);

try { nameInput.value = localStorage.getItem('ftebrazil_player_name') || ''; } catch {}

form.addEventListener('submit', event => {
  const name = cleanPlayerName(nameInput.value);
  if (nameInput.value && !name) {
    event.preventDefault();
    note.textContent = 'Use letras, números, espaços ou . _ [ ] -';
    note.classList.add('error');
    nameInput.focus();
    return;
  }
  nameInput.value = name;
  try { if (name) localStorage.setItem('ftebrazil_player_name', name); } catch {}
});
