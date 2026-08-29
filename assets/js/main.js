const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const header = document.querySelector('[data-header]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setMenu(open) {
  if (!menuButton || !menu) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  const label = menuButton.querySelector('.sr-only');
  if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
}

menuButton?.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const wasOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    setMenu(false);
    if (wasOpen) menuButton?.focus();
  }
});

document.addEventListener('click', (event) => {
  if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
  if (!menu?.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) setMenu(false);
});

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 18);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = String(new Date().getFullYear());
});

const revealItems = document.querySelectorAll(
  '.section-heading, .service-card, .process-intro, .process-list li, .project-card, .projects-footer, .contact-panel'
);

if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  revealItems.forEach((item, index) => {
    item.classList.add('reveal-ready');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}
