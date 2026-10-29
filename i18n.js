// Tradução do site: português é o texto original do HTML; en/es substituem pelos
// elementos marcados com data-i18n (conteúdo) e data-i18n-<atributo> (placeholder, title...).
// Mensagens criadas em JS usam t(chave). Escolha salva em localStorage.
const I18N = {
  en: {
    'meta.title': 'FTE Brazil — QuakeWorld in your browser',
    'skip': 'Skip to content',
    'nav.ranking': 'Ranking', 'nav.how': 'How to play', 'nav.report': 'Report', 'nav.project': 'Project',
    'hero.server': 'Brazilian server · São Paulo',
    'hero.title': 'The arena<br>is back.',
    'hero.lead': 'Real QuakeWorld, right in your browser. Nothing to install, no hassle — pick your name and join the match.',
    'join.name': 'Your arena name',
    'join.name.title': 'Up to 15 letters, numbers, spaces or . _ [ ] -',
    'join.play': 'Play now <span aria-hidden="true">→</span>',
    'join.password': 'Password <span>(optional, protects your nick in the ranking)</span>',
    'join.register': 'Register this nick now',
    'join.logged': 'Logged in as', 'join.logout': 'Log out',
    'live.title': 'LIVE', 'live.loading': 'Loading…', 'live.watch': '▶ Watch now',
    'live.empty': 'Nobody playing right now. Be the first!', 'live.error': 'Live info unavailable right now.',
    'join.watch': '▶ Watch live <span>without joining the match</span>',
    'join.discord': '<strong>South American QuakeWorld Community</strong><span>Welcome! Learn more and play competitive on our Discord →</span>',
    'join.note': 'Recent Chrome, Edge or Firefox · keyboard and mouse recommended',
    'rank.period': 'Period', 'rank.day': 'Today', 'rank.week': 'Week', 'rank.all': 'All time',
    'rank.loading': 'Loading…', 'rank.registered': '✓ REGISTERED NICK',
    'rank.empty': 'Nobody has fragged in this period yet. Be the first.',
    'rank.error': 'Ranking unavailable right now.',
    'rank.mark': 'Registered nick',
    'community.eyebrow': 'South American QuakeWorld Community',
    'community.title': 'Welcome to the Discord.',
    'community.text': "You're welcome on the South American QuakeWorld community Discord. If you want to learn more, find teammates and play competitive, that's where everyone hangs out.",
    'community.button': 'Join the Discord <span aria-hidden="true">→</span>',
    'how.eyebrow': 'First frag in under a minute', 'how.title': 'How to play',
    'how.1': '<strong>Pick your name</strong><span>It is saved in this browser.</span>',
    'how.2': '<strong>Allow the mouse</strong><span>Click the arena to aim freely.</span>',
    'how.3': '<strong>Join the server</strong><span>The client connects to the Brazilian server.</span>',
    'report.eyebrow': 'Found a bug? Someone cheating?', 'report.title': 'Report a problem',
    'report.lead': 'Tell us what happened. The team reads every report.',
    'report.kind': 'Type',
    'report.kind.bug': 'Bug / error in the game or site', 'report.kind.conexao': 'Connection / lag / map does not load',
    'report.kind.jogador': 'Player (cheating, abuse)', 'report.kind.sugestao': 'Suggestion', 'report.kind.outro': 'Other',
    'report.nick': 'Your nick <span>(optional)</span>', 'report.message': 'What happened?',
    'report.placeholder': 'E.g.: on ztndm2 the game froze when I picked up the quad…',
    'report.contact': 'Contact <span>(optional: Discord, e-mail)</span>', 'report.send': 'Send report',
    'report.sending': 'Sending…', 'report.sent': 'Report sent. Thanks for helping!',
    'project.eyebrow': 'Open source, open community', 'project.title': 'Preserve by playing.',
    'project.text': 'FTE Brazil is a community, non-commercial project built on <a href="https://www.fteqw.org/">FTEQW</a>. It is not affiliated with id Software or ZeniMax Media.',
    'project.link': 'Follow development on GitHub →',
    'footer.made': 'FTE BRAZIL · MADE BY THE COMMUNITY', 'footer.since': 'QUAKEWORLD SINCE 1996',
    'online.one': '1 player in the arena now', 'online.many': '{n} players in the arena now',
    'err.name': 'Use letters, numbers, spaces or . _ [ ] -',
    'err.password_nick': 'Pick a nick to use a password.',
    'err.login_required': 'This nick is registered. Enter the password to play with it.',
    'err.accounts': 'Account server unavailable',
    'api.Esse nick já está registrado': 'This nick is already registered',
    'api.Nick ou senha incorretos': 'Wrong nick or password',
    'api.A senha precisa ter pelo menos 6 caracteres': 'The password must have at least 6 characters',
    'api.Nick: até 15 letras, números, espaço ou . _ [ ] -': 'Nick: up to 15 letters, numbers, space or . _ [ ] -',
    'api.Descreva o problema (pelo menos algumas palavras).': 'Describe the problem (at least a few words).',
    'api.Aguarde alguns segundos antes de enviar outro relato.': 'Wait a few seconds before sending another report.',
    'play.preparing': 'Preparing the arena', 'play.loading': 'Loading the FTEQW client…',
    'play.help': 'If this screen does not move on, the WebAssembly build is not installed in <code>vendor/fte/</code> yet.',
    'play.missing': 'FTEQW client not installed yet.', 'play.exit': '← Leave the arena',
    "play.problem": "Could not start the game",
    "play.nowebgl": "Your browser has no WebGL (hardware acceleration is off or the graphics card is not supported).",
    "play.crash": "The game hit an error while loading.",
    "play.gpu_lost": "The graphics card stopped responding to the browser.",
    "play.problem.help": "Try: turn on hardware acceleration in the browser settings, update Chrome/Edge/Firefox, close other heavy tabs. If it keeps happening, use “Report a problem” on the site with this text.",
  },
  es: {
    'meta.title': 'FTE Brazil — QuakeWorld en el navegador',
    'skip': 'Saltar al contenido',
    'nav.ranking': 'Ranking', 'nav.how': 'Cómo jugar', 'nav.report': 'Reportar', 'nav.project': 'Proyecto',
    'hero.server': 'servidor brasileño · São Paulo',
    'hero.title': 'La arena<br>volvió.',
    'hero.lead': 'QuakeWorld de verdad, directo en el navegador. Sin instalar, sin vueltas — elige tu nombre y entra a la partida.',
    'join.name': 'Tu nombre en la arena',
    'join.name.title': 'Hasta 15 letras, números, espacios o . _ [ ] -',
    'join.play': 'Entrar al juego <span aria-hidden="true">→</span>',
    'join.password': 'Contraseña <span>(opcional, protege tu nick en el ranking)</span>',
    'join.register': 'Registrar este nick ahora',
    'join.logged': 'Conectado como', 'join.logout': 'Salir',
    'live.title': 'EN VIVO', 'live.loading': 'Cargando…', 'live.watch': '▶ Ver ahora',
    'live.empty': 'Nadie jugando ahora. ¡Sé el primero!', 'live.error': 'Información en vivo no disponible ahora.',
    'join.watch': '▶ Ver en vivo <span>sin entrar a la partida</span>',
    'join.discord': '<strong>Comunidad Sudamericana de QuakeWorld</strong><span>¡Bienvenido! Aprende más y juega competitivo en nuestro Discord →</span>',
    'join.note': 'Chrome, Edge o Firefox reciente · teclado y mouse recomendados',
    'rank.period': 'Período', 'rank.day': 'Hoy', 'rank.week': 'Semana', 'rank.all': 'General',
    'rank.loading': 'Cargando…', 'rank.registered': '✓ NICK REGISTRADO',
    'rank.empty': 'Nadie hizo frags en este período todavía. Sé el primero.',
    'rank.error': 'Ranking no disponible en este momento.',
    'rank.mark': 'Nick registrado',
    'community.eyebrow': 'Comunidad Sudamericana de QuakeWorld',
    'community.title': 'Bienvenido al Discord.',
    'community.text': 'Eres bienvenido al Discord de la comunidad Sudamericana de QuakeWorld. Si quieres aprender más, encontrar compañeros y jugar competitivo, ahí se junta la gente.',
    'community.button': 'Entrar al Discord <span aria-hidden="true">→</span>',
    'how.eyebrow': 'Primer frag en menos de un minuto', 'how.title': 'Cómo jugar',
    'how.1': '<strong>Elige tu nombre</strong><span>Queda guardado en este navegador.</span>',
    'how.2': '<strong>Permite el mouse</strong><span>Haz clic en la arena para apuntar libremente.</span>',
    'how.3': '<strong>Entra al servidor</strong><span>El cliente se conecta al servidor brasileño.</span>',
    'report.eyebrow': '¿Encontraste un bug? ¿Alguien haciendo trampa?', 'report.title': 'Reportar problema',
    'report.lead': 'Cuéntanos qué pasó. El equipo lee todos los reportes.',
    'report.kind': 'Tipo',
    'report.kind.bug': 'Bug / error en el juego o el sitio', 'report.kind.conexao': 'Conexión / lag / el mapa no carga',
    'report.kind.jogador': 'Jugador (trampa, insultos)', 'report.kind.sugestao': 'Sugerencia', 'report.kind.outro': 'Otro',
    'report.nick': 'Tu nick <span>(opcional)</span>', 'report.message': '¿Qué pasó?',
    'report.placeholder': 'Ej.: en el mapa ztndm2 el juego se trabó cuando agarré el quad…',
    'report.contact': 'Contacto <span>(opcional: Discord, e-mail)</span>', 'report.send': 'Enviar reporte',
    'report.sending': 'Enviando…', 'report.sent': 'Reporte enviado. ¡Gracias por ayudar!',
    'project.eyebrow': 'Código abierto, comunidad abierta', 'project.title': 'Preservar jugando.',
    'project.text': 'FTE Brazil es un proyecto comunitario y sin fines comerciales, construido sobre <a href="https://www.fteqw.org/">FTEQW</a>. No está afiliado a id Software ni a ZeniMax Media.',
    'project.link': 'Seguir el desarrollo en GitHub →',
    'footer.made': 'FTE BRAZIL · HECHO POR LA COMUNIDAD', 'footer.since': 'QUAKEWORLD DESDE 1996',
    'online.one': '1 jugador en la arena ahora', 'online.many': '{n} jugadores en la arena ahora',
    'err.name': 'Usa letras, números, espacios o . _ [ ] -',
    'err.password_nick': 'Elige un nick para usar contraseña.',
    'err.login_required': 'Este nick está registrado. Escribe la contraseña para entrar con él.',
    'err.accounts': 'Servidor de cuentas no disponible',
    'api.Esse nick já está registrado': 'Este nick ya está registrado',
    'api.Nick ou senha incorretos': 'Nick o contraseña incorrectos',
    'api.A senha precisa ter pelo menos 6 caracteres': 'La contraseña debe tener al menos 6 caracteres',
    'api.Nick: até 15 letras, números, espaço ou . _ [ ] -': 'Nick: hasta 15 letras, números, espacio o . _ [ ] -',
    'api.Descreva o problema (pelo menos algumas palavras).': 'Describe el problema (al menos algunas palabras).',
    'api.Aguarde alguns segundos antes de enviar outro relato.': 'Espera unos segundos antes de enviar otro reporte.',
    'play.preparing': 'Preparando la arena', 'play.loading': 'Cargando el cliente FTEQW…',
    'play.help': 'Si esta pantalla no avanza, el build WebAssembly todavía no está instalado en <code>vendor/fte/</code>.',
    'play.missing': 'Cliente FTEQW todavía no instalado.', 'play.exit': '← Salir de la arena',
    "play.problem": "No se pudo abrir el juego",
    "play.nowebgl": "Tu navegador no tiene WebGL (aceleración por hardware desactivada o tarjeta de video sin soporte).",
    "play.crash": "El juego encontró un error al cargar.",
    "play.gpu_lost": "La tarjeta de video dejó de responder al navegador.",
    "play.problem.help": "Prueba: activar la aceleración por hardware en la configuración del navegador, actualizar Chrome/Edge/Firefox, cerrar otras pestañas pesadas. Si sigue pasando, usa “Reportar problema” en el sitio con este texto.",
  },
};

// Textos em português usados só pelo JS (o HTML já traz o português).
const I18N_PT = {
  'live.empty': 'Ninguém jogando agora. Seja o primeiro!', 'live.error': 'Informação ao vivo indisponível agora.',
  'join.note': 'Chrome, Edge ou Firefox recente · teclado e mouse recomendados',
  'rank.empty': 'Ninguém fez frag nesse período ainda. Seja o primeiro.',
  'rank.error': 'Ranking indisponível no momento.',
  'rank.mark': 'Nick registrado',
  'report.sending': 'Enviando…', 'report.sent': 'Relato enviado. Valeu por ajudar!',
  'online.one': '1 jogador na arena agora', 'online.many': '{n} jogadores na arena agora',
  'err.name': 'Use letras, números, espaços ou . _ [ ] -',
  'err.password_nick': 'Escolha um nick para usar senha.',
  'err.login_required': 'Esse nick é registrado. Digite a senha para entrar com ele.',
  'err.accounts': 'Servidor de contas indisponível',
  'play.missing': 'Cliente FTEQW ainda não instalado.',
  "play.problem": "Não deu para abrir o jogo",
  "play.nowebgl": "Seu navegador está sem WebGL (aceleração de hardware desligada ou placa de vídeo sem suporte).",
  "play.crash": "O jogo encontrou um erro ao carregar.",
  "play.gpu_lost": "A placa de vídeo parou de responder ao navegador.",
  "play.problem.help": "Tente: ativar a aceleração de hardware nas configurações do navegador, atualizar o Chrome/Edge/Firefox, fechar outras abas pesadas. Se continuar, use “Reportar problema” no site com este texto.",
};

const LANGS = { pt: 'pt-BR', en: 'en', es: 'es' };
const original = new Map();      // elemento -> HTML original em português
const originalAttrs = new Map(); // elemento -> atributos originais em português
let lang = 'pt';
try { lang = localStorage.getItem('ftebrazil_lang') || ''; } catch {}
if (!LANGS[lang]) lang = (navigator.language || 'pt').slice(0, 2).toLowerCase();
if (!LANGS[lang]) lang = 'pt';

function t(key, vars = {}) {
  let text = (lang !== 'pt' && I18N[lang][key]) || I18N_PT[key] || key;
  for (const [name, value] of Object.entries(vars)) text = text.replace(`{${name}}`, value);
  return text;
}

// Mensagem de erro vinda da API (em português) traduzida quando conhecida.
const tApi = message => (lang !== 'pt' && I18N[lang][`api.${message}`]) || message;

function applyLanguage(next) {
  lang = next;
  try { localStorage.setItem('ftebrazil_lang', lang); } catch {}
  document.documentElement.lang = LANGS[lang];
  for (const el of document.querySelectorAll('[data-i18n]')) {
    if (!original.has(el)) original.set(el, el.innerHTML);
    el.innerHTML = lang === 'pt' ? original.get(el) : I18N[lang][el.dataset.i18n] ?? original.get(el);
  }
  // data-i18n-placeholder="chave", data-i18n-title="chave"...
  for (const el of document.querySelectorAll('[data-i18n-placeholder], [data-i18n-title], [data-i18n-aria-label]')) {
    if (!originalAttrs.has(el)) originalAttrs.set(el, {});
    const saved = originalAttrs.get(el);
    for (const name of ['placeholder', 'title', 'aria-label']) {
      const key = el.getAttribute(`data-i18n-${name}`);
      if (!key) continue;
      if (!(name in saved)) saved[name] = el.getAttribute(name) || '';
      el.setAttribute(name, lang === 'pt' ? saved[name] : I18N[lang][key] ?? saved[name]);
    }
  }
  for (const button of document.querySelectorAll('[data-lang]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  }
  document.dispatchEvent(new CustomEvent('languagechange'));
}

document.addEventListener('DOMContentLoaded', () => {
  for (const button of document.querySelectorAll('[data-lang]')) {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  }
  applyLanguage(lang);
});
