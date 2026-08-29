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

function createFiniPreview(prefix = '') {
  const preview = document.createElement('div');
  preview.className = 'project-preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.style.cssText = 'position:relative;min-height:360px;background:linear-gradient(135deg,#5b2f91,#ff5aa5);overflow:hidden';

  const image = document.createElement('img');
  image.src = `${prefix}imagens/fini/fini-1.webp`;
  image.alt = '';
  image.loading = 'lazy';
  image.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .45s ease';
  preview.appendChild(image);

  const badge = document.createElement('span');
  badge.textContent = 'SWEET EXPERIENCE';
  badge.style.cssText = 'position:absolute;left:22px;top:22px;padding:8px 11px;border-radius:999px;color:#2b1538;background:#ffd83d;font:800 .58rem ui-monospace,monospace;letter-spacing:.09em';
  preview.appendChild(badge);
  return preview;
}

function injectFiniProject() {
  const homeGrid = document.querySelector('.portfolio-home .project-grid');
  if (homeGrid && !homeGrid.querySelector('[data-fini-project]')) {
    const card = document.createElement('a');
    card.className = 'project-card project-primary';
    card.href = 'sistemas/fini.html';
    card.dataset.finiProject = '';
    card.style.gridColumn = '1 / -1';
    card.appendChild(createFiniPreview(''));
    card.insertAdjacentHTML('beforeend', '<div class="project-info"><div><span>Experiência de marca</span><h3>Fini Sweet Experience</h3></div><span class="project-link" aria-hidden="true">Abrir projeto ↗</span></div>');
    card.addEventListener('mouseenter', () => { const img = card.querySelector('img'); if (img) img.style.transform = 'scale(1.035)'; });
    card.addEventListener('mouseleave', () => { const img = card.querySelector('img'); if (img) img.style.transform = ''; });
    homeGrid.prepend(card);
  }

  const demoGrid = document.querySelector('.experiments-page .demo-grid');
  if (demoGrid && !demoGrid.querySelector('[data-fini-project]')) {
    const card = document.createElement('a');
    card.className = 'demo-card';
    card.href = 'fini.html';
    card.dataset.finiProject = '';
    card.appendChild(createFiniPreview('../'));
    card.insertAdjacentHTML('beforeend', '<div class="project-info"><div><span>Experiência de marca</span><h3>Fini Sweet Experience</h3></div><span class="project-link">Abrir ↗</span></div>');
    demoGrid.prepend(card);
  }
}

injectFiniProject();

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

const studio = document.querySelector('.hero-studio');
const studioWindow = studio?.querySelector('.studio-window');

if (studio && studioWindow && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  studio.addEventListener('pointermove', (event) => {
    const bounds = studio.getBoundingClientRect();
    const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -6;
    studioWindow.style.setProperty('--studio-rotate-x', `${rotateX.toFixed(2)}deg`);
    studioWindow.style.setProperty('--studio-rotate-y', `${rotateY.toFixed(2)}deg`);
  });
  studio.addEventListener('pointerleave', () => {
    studioWindow.style.removeProperty('--studio-rotate-x');
    studioWindow.style.removeProperty('--studio-rotate-y');
  });
}
