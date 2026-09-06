const hero = document.querySelector('[data-cinematic-hero]');

if (hero) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    hero.classList.add('hero-cena-estatica');
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
