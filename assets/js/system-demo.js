const initSystemDemo = () => {
  const body = document.body;
  if (!body || !body.classList.contains('demo-system') || body.classList.contains('demo-enhanced')) return;

  const title = body.dataset.demoTitle || 'Sistema demonstrativo';
  const role = body.dataset.demoRole || 'Experiência guiada';
  const summary = body.dataset.demoSummary || 'Explore esta tela para conhecer uma possibilidade de sistema sob medida.';
  const features = (body.dataset.demoFeatures || '').split('|').filter(Boolean);

  const toolbar = document.createElement('header');
  toolbar.className = 'demo-toolbar';
  toolbar.innerHTML = `
    <a class="demo-toolbar-brand" href="../index.html" aria-label="Montes Developers">
      <img src="../logomontes.png" alt="" width="612" height="408">
      <span>Montes<small>Developers</small></span>
    </a>
    <div class="demo-toolbar-context"><small>Demonstração funcional</small><strong>${title}</strong></div>
    <div class="demo-toolbar-actions">
      <a class="demo-toolbar-back" href="sistemas.html"><span aria-hidden="true">←</span> Módulos</a>
      <button class="demo-guide-button" type="button" aria-expanded="false"><i></i> Entender tela</button>
    </div>`;

  const overlay = document.createElement('div');
  overlay.className = 'demo-guide-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  const featureItems = features.map((feature, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${feature}</li>`).join('');
  overlay.innerHTML = `
    <aside class="demo-guide-panel" role="dialog" aria-modal="true" aria-labelledby="demo-guide-title">
      <div class="demo-guide-head"><span>Guia da demonstração</span><button class="demo-guide-close" type="button" aria-label="Fechar guia">×</button></div>
      <h2 id="demo-guide-title">${title}</h2>
      <span class="demo-guide-role">${role}</span>
      <p class="demo-guide-summary">${summary}</p>
      <h3>O que esta tela demonstra</h3>
      <ul class="demo-feature-list">${featureItems}</ul>
      <p class="demo-warning"><strong>Ambiente demonstrativo:</strong> não informe dados pessoais ou senhas reais. O conteúdo existe apenas para apresentar uma possibilidade de produto.</p>
      <a class="demo-guide-cta" href="../index.html#contato">Quero algo assim para meu negócio</a>
    </aside>`;

  body.prepend(toolbar);
  body.append(overlay);
  body.classList.add('demo-enhanced');

  const guideButton = toolbar.querySelector('.demo-guide-button');
  const closeButton = overlay.querySelector('.demo-guide-close');
  const setOpen = (open) => {
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    guideButton.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
    if (open) closeButton.focus();
    else guideButton.focus();
  };

  guideButton.addEventListener('click', () => setOpen(true));
  closeButton.addEventListener('click', () => setOpen(false));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) setOpen(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && overlay.classList.contains('open')) setOpen(false); });
};

if (document.body) initSystemDemo();
else document.addEventListener('DOMContentLoaded', initSystemDemo);
