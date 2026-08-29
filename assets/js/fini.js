const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const root = document.documentElement;
const progress = document.querySelector('[data-progress]');
const header = document.querySelector('[data-header]');
const parallax = document.querySelector('[data-parallax]');

const themes = {
  berry: { accent: '#ff5aa5', rgb: '255, 90, 165', a: '#7b2e6a', b: '#471f78' },
  banana: { accent: '#ffd83d', rgb: '255, 216, 61', a: '#c58b10', b: '#5c3f0c' },
  blue: { accent: '#48cfff', rgb: '72, 207, 255', a: '#178bb8', b: '#304397' },
  pink: { accent: '#ff8fbf', rgb: '255, 143, 191', a: '#ca4d88', b: '#6e2d79' }
};

const revealItems = [...document.querySelectorAll('.reveal')];
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function updateScrollEffects() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const percent = total > 0 ? (window.scrollY / total) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;
  header?.classList.toggle('scrolled', window.scrollY > 18);

  if (parallax && !reduceMotion.matches && window.innerWidth > 900) {
    const rect = parallax.getBoundingClientRect();
    const centerDelta = window.innerHeight / 2 - (rect.top + rect.height / 2);
    parallax.style.transform = `translate3d(0, ${(centerDelta * 0.028).toFixed(2)}px, 0)`;
  } else if (parallax) {
    parallax.style.transform = '';
  }
}

window.addEventListener('scroll', updateScrollEffects, { passive: true });
window.addEventListener('resize', updateScrollEffects);
updateScrollEffects();

document.querySelector('[data-sugar-mode]')?.addEventListener('click', () => {
  document.body.classList.remove('sugar-mode');
  void document.body.offsetWidth;
  document.body.classList.add('sugar-mode');
  window.setTimeout(() => document.body.classList.remove('sugar-mode'), 950);

  if (reduceMotion.matches) return;
  const colors = ['#ff5aa5', '#ffd83d', '#48cfff', '#ffffff', '#9d72ff'];
  const amount = window.innerWidth < 600 ? 14 : 24;
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement('i');
    piece.setAttribute('aria-hidden', 'true');
    piece.style.cssText = [
      'position:fixed', 'z-index:6000', 'pointer-events:none',
      `left:${46 + Math.random() * 8}%`, `top:${42 + Math.random() * 8}%`,
      `width:${6 + Math.random() * 8}px`, `height:${12 + Math.random() * 15}px`,
      'border-radius:999px', `background:${colors[index % colors.length]}`,
      `transform:rotate(${Math.random() * 180}deg)`,
      'transition:transform .85s cubic-bezier(.2,.75,.2,1),opacity .85s ease'
    ].join(';');
    document.body.appendChild(piece);
    requestAnimationFrame(() => {
      const x = (Math.random() - 0.5) * Math.min(window.innerWidth * 0.75, 650);
      const y = 120 + Math.random() * Math.min(window.innerHeight * 0.55, 480);
      piece.style.transform = `translate(${x}px,${y}px) rotate(${360 + Math.random() * 560}deg)`;
      piece.style.opacity = '0';
    });
    window.setTimeout(() => piece.remove(), 900);
  }
});

document.querySelectorAll('[data-theme]').forEach((button) => {
  button.addEventListener('click', () => {
    const theme = themes[button.dataset.theme];
    if (!theme) return;

    document.querySelectorAll('[data-theme]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-rgb', theme.rgb);
    root.style.setProperty('--stage-a', theme.a);
    root.style.setProperty('--stage-b', theme.b);
  });
});

if (!reduceMotion.matches && finePointer.matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${(y * -2.4).toFixed(2)}deg) rotateY(${(x * 3.2).toFixed(2)}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
