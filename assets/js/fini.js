const flavors = {
  worms: {
    number: '01', kicker: 'Azedinho primeiro', title: 'Minhocas<br>Azedinhas', word: 'WOW!',
    description: 'Um choque de cores, açúcar e acidez para quem gosta de começar a diversão no volume máximo.',
    color: '#ff5f9e', color2: '#39c9f2', sweet: '68%', sour: '92%',
    gummy: 'linear-gradient(90deg,#44b6ee 0 26%,#41d399 26% 47%,#ffdd36 47% 69%,#ff617f 69%)'
  },
  kisses: {
    number: '02', kicker: 'Doce na medida', title: 'Beijos de<br>Morango', word: 'LOVE',
    description: 'Macio, açucarado e com sabor de morango: uma vibe leve para compartilhar com quem faz o dia melhor.',
    color: '#f04783', color2: '#ffb2cc', sweet: '94%', sour: '18%',
    gummy: 'linear-gradient(90deg,#ff9abd,#ff3d79 72%,#fff1f6 73%)'
  },
  berries: {
    number: '03', kicker: 'Pequena e intensa', title: 'Amoras<br>Vibrantes', word: 'BOLD',
    description: 'Uma combinação marcante de frutas vermelhas e textura para quem transforma qualquer momento em presença.',
    color: '#7040c5', color2: '#37206f', sweet: '82%', sour: '42%',
    gummy: 'linear-gradient(90deg,#39216d,#7140bf 48%,#ad68ef)'
  },
  bananas: {
    number: '04', kicker: 'Sol em forma de doce', title: 'Bananas<br>Solares', word: 'YAY!',
    description: 'Uma escolha divertida, macia e cheia de personalidade para deixar qualquer pausa mais amarela e feliz.',
    color: '#ffac31', color2: '#ffe052', sweet: '88%', sour: '12%',
    gummy: 'linear-gradient(90deg,#ff9e27,#ffe84c 48%,#fff3a1)'
  }
};

const mixer = document.querySelector('[data-mixer]');
const gummyPieces = document.querySelectorAll('[data-gummy] span');
const controls = document.querySelectorAll('[data-flavor]');

function setContent(selector, value, html = false) {
  const element = document.querySelector(selector);
  if (!element) return;
  if (html) element.innerHTML = value;
  else element.textContent = value;
}

function selectFlavor(key) {
  const flavor = flavors[key];
  if (!flavor || !mixer) return;
  mixer.style.setProperty('--mix', flavor.color);
  mixer.style.setProperty('--mix2', flavor.color2);
  setContent('[data-number]', flavor.number);
  setContent('[data-kicker]', flavor.kicker);
  setContent('[data-title]', flavor.title, true);
  setContent('[data-big-word]', flavor.word);
  setContent('[data-description]', flavor.description);
  document.querySelector('[data-sweet]')?.style.setProperty('--level', flavor.sweet);
  document.querySelector('[data-sour]')?.style.setProperty('--level', flavor.sour);
  gummyPieces.forEach((piece) => { piece.style.background = flavor.gummy; });
  controls.forEach((control) => {
    const active = control.dataset.flavor === key;
    control.classList.toggle('active', active);
    control.setAttribute('aria-pressed', String(active));
  });
  document.body.classList.remove('flavor-change');
  void document.body.offsetWidth;
  document.body.classList.add('flavor-change');
  window.setTimeout(() => document.body.classList.remove('flavor-change'), 520);
}

controls.forEach((control) => control.addEventListener('click', () => selectFlavor(control.dataset.flavor)));
selectFlavor('worms');

const cursor = document.querySelector('[data-cursor]');
if (cursor && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = '1';
  });
  document.querySelectorAll('a,button').forEach((interactive) => {
    interactive.addEventListener('pointerenter', () => {
      cursor.style.width = '34px'; cursor.style.height = '34px';
    });
    interactive.addEventListener('pointerleave', () => {
      cursor.style.width = '18px'; cursor.style.height = '18px';
    });
  });
}

const heroArt = document.querySelector('.hero-art');
if (heroArt && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / innerWidth - .5) * 12;
    const y = (event.clientY / innerHeight - .5) * 10;
    heroArt.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
}
