(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-botao');
  const mobileMenu = document.querySelector('.menu-movel');

  const updateHeader = () => header?.classList.toggle('rolado', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-aberto');
  };

  menuButton?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.hidden = !opening;
    document.body.classList.toggle('menu-aberto', opening);
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeMenu();
  });

  const immersiveHero = document.querySelector('[data-hero]');
  if (immersiveHero && !reducedMotion) {
    let heroVisible = true;
    let heroFrame = 0;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const updateHeroScroll = () => {
      heroFrame = 0;
      if (!heroVisible) return;
      const rect = immersiveHero.getBoundingClientRect();
      const distance = Math.max(1, immersiveHero.offsetHeight - window.innerHeight * 0.55);
      const progressValue = clamp(-rect.top / distance, 0, 1);
      immersiveHero.style.setProperty('--hero-progress', progressValue.toFixed(3));
    };
    const requestHeroUpdate = () => {
      if (!heroFrame) heroFrame = window.requestAnimationFrame(updateHeroScroll);
    };
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) requestHeroUpdate();
    }, { rootMargin: '10% 0px' });
    heroObserver.observe(immersiveHero);
    window.addEventListener('scroll', requestHeroUpdate, { passive: true });
    window.addEventListener('resize', requestHeroUpdate, { passive: true });
    immersiveHero.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || window.innerWidth <= 1080) return;
      const bounds = immersiveHero.getBoundingClientRect();
      immersiveHero.style.setProperty('--pointer-x', ((event.clientX - bounds.left) / bounds.width * 2 - 1).toFixed(3));
      immersiveHero.style.setProperty('--pointer-y', ((event.clientY - bounds.top) / bounds.height * 2 - 1).toFixed(3));
    });
    immersiveHero.addEventListener('pointerleave', () => {
      immersiveHero.style.setProperty('--pointer-x', '0');
      immersiveHero.style.setProperty('--pointer-y', '0');
    });
    updateHeroScroll();
  }

  const revealItems = document.querySelectorAll('.revelar');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visivel'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visivel');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const serviceButtons = document.querySelectorAll('[data-services] .servico');
  const servicePreview = document.querySelector('[data-service-preview]');
  const serviceImage = document.querySelector('[data-service-image]');
  const serviceKicker = document.querySelector('[data-service-kicker]');
  const serviceCaption = document.querySelector('[data-service-caption]');

  serviceButtons.forEach((button) => {
    const selectService = () => {
      if (!serviceImage || !serviceKicker || !serviceCaption || !servicePreview) return;
      serviceButtons.forEach((item) => item.classList.toggle('ativo', item === button));
      servicePreview.classList.add('trocando');
      const preload = new Image();
      preload.src = button.dataset.image || '';
      const apply = () => {
        serviceImage.src = button.dataset.image || serviceImage.src;
        serviceKicker.textContent = button.dataset.kicker || '';
        serviceCaption.textContent = button.dataset.caption || '';
        window.setTimeout(() => servicePreview.classList.remove('trocando'), reducedMotion ? 0 : 80);
      };
      preload.complete ? apply() : preload.addEventListener('load', apply, { once: true });
    };
    button.addEventListener('click', selectService);
    button.addEventListener('mouseenter', selectService);
  });

  const processSteps = [...document.querySelectorAll('[data-process-step]')];
  const progress = document.querySelector('[data-process-progress]');
  if (processSteps.length && progress && 'IntersectionObserver' in window) {
    const processObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = processSteps.indexOf(visible.target);
      progress.style.width = `${((index + 1) / processSteps.length) * 100}%`;
    }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -35% 0px' });
    processSteps.forEach((step) => processObserver.observe(step));
  }

  const exampleConversation = document.querySelector('[data-conversation-demo]');
  if (exampleConversation && 'IntersectionObserver' in window) {
    const conversationObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      exampleConversation.querySelectorAll('.fala').forEach((bubble, index) => {
        window.setTimeout(() => bubble.classList.add('visivel'), reducedMotion ? 0 : index * 360);
      });
      observer.disconnect();
    }, { threshold: 0.4 });
    conversationObserver.observe(exampleConversation);
  }

  document.querySelectorAll('[data-year]').forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
})();
