const hero = document.querySelector('[data-cinematic-hero]');

if (hero) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const constrainedDevice = window.innerWidth <= 720
    && ((navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2));
  document.documentElement.classList.add('hero-experience');
  hero.classList.add('hero-entrada');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    hero.classList.add('hero-entrada-pronta');
    document.documentElement.classList.add('hero-experience-ready');
  }));
  if (reducedMotion.matches || constrainedDevice) {
    hero.classList.add('hero-cena-estatica');
    if (constrainedDevice) hero.dataset.sceneMode = 'economy';
  } else {
    let requested = false;
    const loadScene = () => {
      if (requested) return;
      requested = true;
      import('./hero-scene.js').catch(() => {
        hero.classList.add('hero-cena-estatica');
        hero.dataset.sceneError = 'module';
      });
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadScene();
      }, { rootMargin: '25% 0px' });
      observer.observe(hero);
    } else {
      loadScene();
    }
  }
}
