(() => {
  'use strict';

  const flavors = {
    original: {
      index: '01', id: 'M—01', accent: '#a6ff22', rgb: '166,255,34', deep: '#071006',
      line: 'Monster Energy / Original', title: 'Original Green', type: 'ORIGINAL',
      description: 'O clássico que começou tudo. Intenso, direto e impossível de confundir.',
      image: '../imagens/original.png', alt: 'Lata Monster Energy Original Green',
      facts: [['160mg', 'Cafeína'], ['500ml', 'Volume'], ['Original', 'Linha']],
      particles: ['166,255,34', '221,255,190', '87,140,29']
    },
    mango: {
      index: '02', id: 'M—02', accent: '#28d7ff', rgb: '40,215,255', deep: '#061721',
      line: 'Juice Monster / Mango Loco', title: 'Mango Loco', type: 'TROPICAL',
      description: 'Manga e frutas exóticas em uma colisão tropical vibrante, feita para quebrar a rotina.',
      image: '../imagens/mango.png', alt: 'Lata Monster Energy Mango Loco',
      facts: [['160mg', 'Cafeína'], ['15%', 'Suco'], ['Juice', 'Linha']],
      particles: ['40,215,255', '255,170,42', '255,224,110']
    },
    strawberry: {
      index: '03', id: 'M—03', accent: '#ff9fd0', rgb: '255,159,208', deep: '#25111e',
      line: 'Monster Ultra / Strawberry Dreams', title: 'Strawberry Dreams', type: 'DREAMSTATE',
      description: 'Morango suave, atmosfera etérea e a energia da linha Ultra — sem açúcar, sem monotonia.',
      image: '../imagens/strawberry.png', alt: 'Lata Monster Energy Ultra Strawberry Dreams',
      facts: [['0g', 'Açúcar'], ['473ml', 'Volume'], ['Ultra', 'Linha']],
      particles: ['255,159,208', '255,236,246', '202,92,150']
    },
    watermelon: {
      index: '04', id: 'M—04', accent: '#ff3d4e', rgb: '255,61,78', deep: '#210609',
      line: 'Monster Ultra / Watermelon', title: 'Ultra Watermelon', type: 'RUSH',
      description: 'Melancia refrescante, perfil leve e uma batida vermelha que mantém tudo em movimento.',
      image: '../imagens/monster-ultra-watermelon.png', alt: 'Lata Monster Energy Ultra Watermelon',
      facts: [['0g', 'Açúcar'], ['473ml', 'Volume'], ['Ultra', 'Linha']],
      particles: ['255,61,78', '255,196,201', '142,12,25']
    }
  };

  const keys = Object.keys(flavors);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const body = document.body;
  const story = document.querySelector('[data-story]');
  const storyFrame = story?.querySelector('.story-frame');
  const progressBar = document.querySelector('[data-progress]');
  const header = document.querySelector('[data-header]');
  const particleCanvas = document.querySelector('[data-particles]');
  const lab = document.querySelector('[data-flavor-lab]');
  const montesCta = document.querySelector('.montes-cta');
  const labCan = document.querySelector('[data-lab-can]');
  const labTabs = [...document.querySelectorAll('[data-lab-flavor]')];
  const dragZone = document.querySelector('[data-drag-zone]');
  let storyFlavor = 'original';
  let labFlavor = 'original';
  let storyTop = 0;
  let storyDistance = 1;
  let scrollTicking = false;
  let storyIsVisible = true;
  let labIsVisible = false;

  const write = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  const setTheme = (key) => {
    const flavor = flavors[key];
    if (!flavor) return;
    body.dataset.flavor = key;
    root.style.setProperty('--flavor', flavor.accent);
    root.style.setProperty('--flavor-rgb', flavor.rgb);
    root.style.setProperty('--flavor-deep', flavor.deep);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', flavor.deep);
    particles?.setFlavor(key);
  };

  const activateStory = (key) => {
    if (!flavors[key] || key === storyFlavor) return;
    const previous = storyFlavor;
    storyFlavor = key;
    setTheme(key);

    document.querySelector(`[data-world="${previous}"]`)?.classList.remove('is-active');
    document.querySelector(`[data-world="${key}"]`)?.classList.add('is-active');
    document.querySelector(`[data-world-word="${previous}"]`)?.classList.remove('is-active');
    document.querySelector(`[data-world-word="${key}"]`)?.classList.add('is-active');
    document.querySelector(`[data-chapter="${previous}"]`)?.classList.remove('is-active');
    document.querySelector(`[data-chapter="${key}"]`)?.classList.add('is-active');

    const outgoing = document.querySelector(`[data-story-can="${previous}"]`);
    const incoming = document.querySelector(`[data-story-can="${key}"]`);
    if (outgoing) {
      outgoing.classList.remove('is-active');
      outgoing.classList.add('is-leaving');
      outgoing.alt = '';
      outgoing.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => outgoing.classList.remove('is-leaving'), reducedMotion ? 0 : 900);
    }
    if (incoming) {
      incoming.classList.add('is-active');
      incoming.alt = flavors[key].alt;
      incoming.setAttribute('aria-hidden', 'false');
    }

    document.querySelectorAll('[data-jump]').forEach((button) => button.classList.toggle('is-active', button.dataset.jump === key));
    write('[data-header-index]', flavors[key].index);
    write('[data-chapter-count]', flavors[key].index);
    write('[data-product-id]', flavors[key].id);
  };

  const updateStoryFromScroll = () => {
    const y = window.scrollY;
    const progress = Math.max(0, Math.min(0.9999, (y - storyTop) / storyDistance));
    const index = Math.min(keys.length - 1, Math.floor(progress * keys.length));
    const nextKey = keys[index];
    if (storyIsVisible && nextKey !== storyFlavor) activateStory(nextKey);

    const local = (progress * keys.length) % 1;
    if (storyFrame && storyIsVisible && !reducedMotion) {
      const drift = Math.sin(local * Math.PI);
      storyFrame.style.setProperty('--story-local', local.toFixed(3));
      const canStack = storyFrame.querySelector('[data-can-stack]');
      if (canStack) canStack.style.transform = `translate3d(0, ${(-drift * 10).toFixed(2)}px, 0) rotate(${((local - .5) * 2.4).toFixed(2)}deg)`;
    }
  };

  const updateScrollUi = () => {
    scrollTicking = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
    header?.classList.toggle('is-solid', scrollY > 40);
    updateStoryFromScroll();
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollUi);
  };

  const measureStory = () => {
    if (!story) return;
    const rect = story.getBoundingClientRect();
    storyTop = rect.top + scrollY;
    storyDistance = Math.max(1, story.offsetHeight - innerHeight);
    requestScrollUpdate();
  };

  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas?.getContext('2d', { alpha: true });
      this.items = [];
      this.running = true;
      this.lastTime = performance.now();
      this.pointerX = .5;
      this.pointerY = .5;
      this.colors = flavors.original.particles;
      this.mode = 'original';
      this.frame = 0;
      if (!this.ctx) return;
      this.resize();
      this.populate();
      this.loop = this.loop.bind(this);
      this.frame = requestAnimationFrame(this.loop);
    }

    resize() {
      if (!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.15 : 1.5);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    populate() {
      const count = reducedMotion ? 14 : (innerWidth < 760 ? 26 : 58);
      this.items = Array.from({ length: count }, () => this.createParticle(true));
    }

    createParticle(randomY = false) {
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : this.height + Math.random() * 60,
        size: .6 + Math.random() * 2.2,
        speed: .18 + Math.random() * .65,
        drift: (Math.random() - .5) * .22,
        alpha: .16 + Math.random() * .52,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      };
    }

    setFlavor(key) {
      if (!flavors[key]) return;
      this.mode = key;
      this.colors = flavors[key].particles;
      this.items.forEach((item) => { item.color = this.colors[Math.floor(Math.random() * this.colors.length)]; });
    }

    setPointer(x, y) {
      this.pointerX = x;
      this.pointerY = y;
    }

    loop(time) {
      if (!this.ctx) return;
      const delta = Math.min(2, (time - this.lastTime) / 16.67);
      this.lastTime = time;
      if (this.running && !document.hidden) this.draw(delta);
      this.frame = requestAnimationFrame(this.loop);
    }

    draw(delta) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      const px = (this.pointerX - .5) * 10;
      const py = (this.pointerY - .5) * 5;

      this.items.forEach((item, i) => {
        item.y -= item.speed * delta * (this.mode === 'watermelon' ? 2.2 : 1);
        item.x += (item.drift + px * .002) * delta;
        if (item.y < -30 || item.x < -40 || item.x > this.width + 40) Object.assign(item, this.createParticle(false));
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${item.color},${item.alpha})`;
        ctx.fillStyle = `rgba(${item.color},${item.alpha})`;

        if (this.mode === 'watermelon') {
          ctx.lineWidth = Math.max(.5, item.size * .45);
          ctx.moveTo(item.x - 20 - item.size * 5, item.y + 9 + py);
          ctx.lineTo(item.x + 20, item.y - 9 + py);
          ctx.stroke();
        } else if (this.mode === 'strawberry') {
          ctx.arc(item.x + px, item.y + py, item.size * 2.2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (this.mode === 'mango') {
          ctx.arc(item.x + px, item.y + py, item.size * 1.45, 0, Math.PI * 2);
          i % 3 ? ctx.fill() : ctx.stroke();
        } else {
          ctx.rect(item.x + px, item.y + py, item.size, item.size * 2.8);
          ctx.fill();
        }
      });
    }
  }

  const particles = particleCanvas ? new ParticleField(particleCanvas) : null;

  const selectLabFlavor = (key, options = {}) => {
    if (!flavors[key] || (key === labFlavor && !options.force)) return;
    labFlavor = key;
    const flavor = flavors[key];
    setTheme(key);
    write('[data-lab-line]', flavor.line);
    write('[data-lab-title]', flavor.title);
    write('[data-lab-description]', flavor.description);
    write('[data-lab-type]', flavor.type);
    write('[data-lab-index]', flavor.index);
    write('[data-header-index]', flavor.index);
    document.querySelector('#flavor-panel')?.setAttribute('aria-labelledby', `tab-${key}`);
    ['a', 'b', 'c'].forEach((letter, index) => {
      write(`[data-lab-fact-${letter}]`, flavor.facts[index][0]);
      write(`[data-lab-label-${letter}]`, flavor.facts[index][1]);
    });

    if (labCan) {
      labCan.classList.remove('is-changing');
      void labCan.offsetWidth;
      labCan.src = flavor.image;
      labCan.classList.add('is-changing');
      window.setTimeout(() => labCan.classList.remove('is-changing'), reducedMotion ? 0 : 850);
    }

    labTabs.forEach((tab) => {
      const selected = tab.dataset.labFlavor === key;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    write('[data-live-status]', `${flavor.title} selecionado`);
  };

  const stepLab = (direction) => {
    const current = keys.indexOf(labFlavor);
    const next = (current + direction + keys.length) % keys.length;
    selectLabFlavor(keys[next]);
  };

  labTabs.forEach((tab) => {
    tab.addEventListener('click', () => selectLabFlavor(tab.dataset.labFlavor));
    tab.addEventListener('keydown', (event) => {
      const current = keys.indexOf(tab.dataset.labFlavor);
      let next = current;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % keys.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + keys.length) % keys.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = keys.length - 1;
      else return;
      event.preventDefault();
      selectLabFlavor(keys[next]);
      labTabs[next].focus();
    });
  });

  document.querySelectorAll('[data-direction]').forEach((button) => {
    button.addEventListener('click', () => stepLab(button.dataset.direction === 'next' ? 1 : -1));
  });

  if (dragZone) {
    let startX = 0;
    let startY = 0;
    let pointerId = null;
    dragZone.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button,a')) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      dragZone.classList.add('is-dragging');
      dragZone.setPointerCapture?.(pointerId);
    });
    dragZone.addEventListener('pointerup', (event) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.25) stepLab(dx < 0 ? 1 : -1);
      pointerId = null;
      dragZone.classList.remove('is-dragging');
    });
    dragZone.addEventListener('pointercancel', () => {
      pointerId = null;
      dragZone.classList.remove('is-dragging');
    });
    dragZone.addEventListener('dragstart', (event) => event.preventDefault());
  }

  document.querySelectorAll('[data-jump]').forEach((button, index) => {
    button.addEventListener('click', () => {
      const target = storyTop + storyDistance * ((index + .035) / keys.length);
      scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  const setupCursor = () => {
    const cursor = document.querySelector('[data-cursor]');
    const label = document.querySelector('[data-cursor-label]');
    if (!cursor || !finePointer || reducedMotion) return;
    body.classList.add('has-custom-cursor');
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let renderX = x;
    let renderY = y;
    const loop = () => {
      renderX += (x - renderX) * .2;
      renderY += (y - renderY) * .2;
      cursor.style.transform = `translate3d(${renderX}px,${renderY}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add('is-visible');
      const context = event.target.closest('[data-cursor-text]');
      cursor.classList.toggle('is-context', Boolean(context));
      if (label) label.textContent = context?.dataset.cursorText || '';
    }, { passive: true });
    addEventListener('scroll', () => {
      cursor.classList.remove('is-context');
      if (label) label.textContent = '';
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    loop();
  };

  const setupParallax = () => {
    if (!storyFrame || !finePointer || reducedMotion) return;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    storyFrame.addEventListener('pointermove', (event) => {
      targetX = (event.clientX / innerWidth - .5) * 18;
      targetY = (event.clientY / innerHeight - .5) * 12;
      particles?.setPointer(event.clientX / innerWidth, event.clientY / innerHeight);
    }, { passive: true });
    storyFrame.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
    const loop = () => {
      currentX += (targetX - currentX) * .055;
      currentY += (targetY - currentY) * .055;
      storyFrame.style.setProperty('--pointer-x', `${currentX.toFixed(2)}px`);
      storyFrame.style.setProperty('--pointer-y', `${currentY.toFixed(2)}px`);
      const chamber = storyFrame.querySelector('.product-chamber');
      if (chamber) {
        chamber.style.setProperty('--mx', `${currentX.toFixed(2)}px`);
        chamber.style.setProperty('--my', `${currentY.toFixed(2)}px`);
      }
      requestAnimationFrame(loop);
    };
    loop();
  };

  const setupMagnetic = () => {
    if (!finePointer || reducedMotion) return;
    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .12;
        const y = (event.clientY - rect.top - rect.height / 2) * .12;
        element.style.transform = `translate3d(${x}px,${y}px,0)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  };

  const setupObservers = () => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === story) {
          storyIsVisible = entry.isIntersecting;
          particles && (particles.running = entry.isIntersecting);
          if (entry.isIntersecting) {
            setTheme(storyFlavor);
            requestScrollUpdate();
          }
        }
        if (entry.target === lab) {
          labIsVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            setTheme(labFlavor);
            write('[data-header-index]', flavors[labFlavor].index);
          }
        }
        if (entry.target === montesCta && entry.isIntersecting) {
          root.style.setProperty('--flavor', '#45d9ff');
          root.style.setProperty('--flavor-rgb', '69,217,255');
          write('[data-header-index]', 'MD');
        }
      });
    }, { threshold: .08 });
    story && observer.observe(story);
    lab && observer.observe(lab);
    montesCta && observer.observe(montesCta);
  };

  const setupGsap = () => {
    if (!window.gsap || !window.ScrollTrigger || reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.manifesto-inner > *', {
      scrollTrigger: { trigger: '.energy-manifesto', start: 'top 72%', once: true },
      y: 60, opacity: .28, duration: .85, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity'
    });
    gsap.to('.manifesto-track span', {
      xPercent: -16, ease: 'none', scrollTrigger: { trigger: '.energy-manifesto', start: 'top bottom', end: 'bottom top', scrub: .7 }
    });
    gsap.from('.lab-head > *', {
      scrollTrigger: { trigger: '.flavor-lab', start: 'top 70%', once: true },
      y: 46, opacity: .28, duration: .8, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity'
    });
    gsap.from('.montes-signal', {
      scrollTrigger: { trigger: '.montes-cta', start: 'top 68%', once: true },
      scale: .78, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity'
    });
    gsap.to('.montes-transition p', {
      xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.montes-transition', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  };

  const revealExperience = () => {
    const loader = document.querySelector('[data-loader]');
    if (!loader) return;
    write('[data-loader-count]', '100');
    const line = document.querySelector('[data-loader-line]');
    if (line) line.style.width = '100%';
    loader.classList.add('is-complete');
    body.classList.add('experience-ready');
    window.setTimeout(() => loader.setAttribute('aria-hidden', 'true'), 1000);
  };

  const boot = () => {
    const loaderLine = document.querySelector('[data-loader-line]');
    const loaderCount = document.querySelector('[data-loader-count]');
    const assets = [...document.querySelectorAll('.story-can')];
    const tasks = assets.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }));
    if (document.fonts?.ready) tasks.push(document.fonts.ready.catch(() => {}));
    let completed = 0;
    tasks.forEach((task) => Promise.resolve(task).finally(() => {
      completed += 1;
      const percent = Math.round(completed / tasks.length * 100);
      if (loaderLine) loaderLine.style.width = `${percent}%`;
      if (loaderCount) loaderCount.textContent = String(percent).padStart(2, '0');
    }));
    Promise.race([
      Promise.allSettled(tasks),
      new Promise((resolve) => window.setTimeout(resolve, 2400))
    ]).then(() => requestAnimationFrame(() => requestAnimationFrame(revealExperience)));
  };

  let resizeTimer = 0;
  addEventListener('scroll', requestScrollUpdate, { passive: true });
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measureStory();
      particles?.resize();
      particles?.populate();
      window.ScrollTrigger?.refresh();
    }, 140);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (particles) particles.running = !document.hidden && storyIsVisible;
  });

  setTheme('original');
  selectLabFlavor('original', { force: true });
  measureStory();
  setupObservers();
  setupCursor();
  setupParallax();
  setupMagnetic();
  setupGsap();
  boot();
})();
