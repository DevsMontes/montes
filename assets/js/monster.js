const flavors = {
  original: {
    accent: '#8fce38', rgb: '143, 206, 56', line: 'Original', title: 'Original<br>Green',
    slogan: 'Libere a besta.',
    description: 'O clássico que começou tudo: sabor intenso, atitude sem filtro e energia para ir além.',
    image: '../imagens/original.png', alt: 'Lata Monster Energy Original Green', code: 'M-01',
    facts: [['160mg', 'Cafeína'], ['500ml', 'Volume'], ['Original', 'Linha']]
  },
  mango: {
    accent: '#21b6e7', rgb: '33, 182, 231', line: 'Juice', title: 'Mango<br>Loco',
    slogan: 'Caos tropical.',
    description: 'Uma combinação vibrante de manga e frutas exóticas para uma experiência intensa e tropical.',
    image: '../imagens/mango.png', alt: 'Lata Monster Energy Mango Loco', code: 'M-02',
    facts: [['160mg', 'Cafeína'], ['15%', 'Suco'], ['Mango', 'Linha']]
  },
  strawberry: {
    accent: '#f6a3c6', rgb: '246, 163, 198', line: 'Ultra', title: 'Strawberry<br>Dreams',
    slogan: 'Zero açúcar. Puro sonho.',
    description: 'Morango suave, final refrescante e toda a energia da linha Ultra em uma edição marcante.',
    image: '../imagens/strawberry.png', alt: 'Lata Monster Energy Ultra Strawberry Dreams', code: 'M-03',
    facts: [['0g', 'Açúcar'], ['473ml', 'Volume'], ['Ultra', 'Linha']]
  },
  watermelon: {
    accent: '#f1494e', rgb: '241, 73, 78', line: 'Ultra', title: 'Ultra<br>Watermelon',
    slogan: 'O verão não para.',
    description: 'Melancia refrescante, perfil leve e energia sem açúcar para manter o ritmo em alta.',
    image: '../imagens/monster-ultra-watermelon.png', alt: 'Lata Monster Energy Ultra Watermelon', code: 'M-04',
    facts: [['0g', 'Açúcar'], ['473ml', 'Volume'], ['Ultra', 'Linha']]
  }
};

const root = document.documentElement;
const stage = document.querySelector('[data-stage]');
const can = document.querySelector('[data-can]');
const controls = [...document.querySelectorAll('[data-flavor]')];
let currentFlavor = 'original';

function write(selector, value, html = false) {
  const element = document.querySelector(selector);
  if (!element) return;
  if (html) element.innerHTML = value;
  else element.textContent = value;
}

function selectFlavor(key, options = {}) {
  const flavor = flavors[key];
  if (!flavor || key === currentFlavor && !options.force) return;
  currentFlavor = key;
  root.style.setProperty('--accent', flavor.accent);
  root.style.setProperty('--accent-rgb', flavor.rgb);
  write('[data-line]', flavor.line);
  write('[data-title]', flavor.title, true);
  write('[data-slogan]', flavor.slogan);
  write('[data-description]', flavor.description);
  write('[data-code]', flavor.code);
  flavor.facts.forEach(([value, label], index) => {
    const names = ['one', 'two', 'three'];
    write(`[data-fact-${names[index]}-value]`, value);
    write(`[data-fact-${names[index]}-label]`, label);
  });
  can.src = flavor.image;
  can.alt = flavor.alt;
  controls.forEach((control) => {
    const active = control.dataset.flavor === key;
    control.classList.toggle('active', active);
    control.setAttribute('aria-pressed', String(active));
  });
  document.body.classList.remove('is-switching');
  void document.body.offsetWidth;
  document.body.classList.add('is-switching');
  window.setTimeout(() => document.body.classList.remove('is-switching'), 450);
  if (options.scroll) stage.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

controls.forEach((control) => control.addEventListener('click', () => selectFlavor(control.dataset.flavor)));
document.querySelectorAll('[data-card-flavor]').forEach((card) => {
  card.addEventListener('click', () => selectFlavor(card.dataset.cardFlavor, { scroll: true }));
});

document.querySelector('[data-energy-button]')?.addEventListener('click', () => {
  document.body.classList.remove('is-energized');
  void document.body.offsetWidth;
  document.body.classList.add('is-energized');
  window.setTimeout(() => document.body.classList.remove('is-energized'), 760);
});

window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  const progress = total > 0 ? scrollY / total * 100 : 0;
  document.querySelector('[data-progress]').style.width = `${progress}%`;
}, { passive: true });

selectFlavor('original', { force: true });
