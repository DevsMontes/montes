const demoData = {
  jobs: {
    'LC-1042': { customer: 'Marina Costa', car: 'Honda HR-V 2021', plate: 'BRA2E19', service: 'Revisão preventiva', phone: '(61) 99918-2040', quote: 'R$ 860,00', stage: 'queue' },
    'LC-1043': { customer: 'Rafael Mendes', car: 'Toyota Corolla 2020', plate: 'PQR8B42', service: 'Diagnóstico eletrônico', phone: '(61) 99842-1130', quote: 'Em análise', stage: 'work' },
    'LC-1044': { customer: 'Camila Rocha', car: 'Jeep Renegade 2022', plate: 'JKL4A77', service: 'Troca de óleo e filtros', phone: '(61) 99110-7244', quote: 'R$ 540,00', stage: 'done' },
    'LC-1045': { customer: 'Lucas Nunes', car: 'VW T-Cross 2023', plate: 'NTS6C31', service: 'Ruído na suspensão', phone: '(61) 99770-4182', quote: 'R$ 1.240,00', stage: 'queue' }
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let toastTimer;

function toast(message) {
  let element = $('.toast');
  if (!element) {
    element = document.createElement('div');
    element.className = 'toast';
    element.setAttribute('role', 'status');
    document.body.append(element);
  }
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2400);
}

function initChrome() {
  const body = document.body;
  const title = body.dataset.demoTitle || 'Demonstração';
  const toolbar = document.createElement('header');
  toolbar.className = 'demo-toolbar';
  toolbar.innerHTML = `
    <a class="demo-toolbar-brand" href="../index.html" aria-label="Montes Developers">
      <img src="../logomontes.png" alt="" width="612" height="408"><span>Montes<small>Developers</small></span>
    </a>
    <div class="demo-toolbar-context"><small>Ambiente de demonstração</small><strong>${title}</strong></div>
    <div class="demo-toolbar-actions">
      <a class="demo-toolbar-back" href="sistemas.html"><span aria-hidden="true">←</span> Laboratório</a>
      <button class="demo-feature-button" type="button" aria-expanded="false"><i></i> Visualizar funcionalidades</button>
    </div>`;
  body.prepend(toolbar);

  const targets = $$('[data-feature]');
  targets.forEach((target, index) => {
    target.classList.add('feature-target');
    target.dataset.featureIndex = String(index + 1).padStart(2, '0');
  });

  const overlay = document.createElement('div');
  overlay.className = 'feature-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <aside class="feature-map" role="dialog" aria-modal="true" aria-labelledby="feature-map-title">
      <div class="feature-map-head"><span>Mapa da interface</span><button class="feature-map-close" type="button" aria-label="Fechar">×</button></div>
      <h2 id="feature-map-title">Como esta tela funciona</h2>
      <p>Os números destacam o que o usuário enxerga e o que cada parte resolve na operação.</p>
      <ol class="feature-tree">${targets.map((target, index) => {
        const [name, detail = 'Funcionalidade demonstrativa adaptável ao projeto.'] = (target.dataset.feature || '').split('|');
        return `<li><span>${String(index + 1).padStart(2, '0')}</span><strong>${name}</strong><small>${detail}</small></li>`;
      }).join('')}</ol>
    </aside>`;
  body.append(overlay);

  const button = $('.demo-feature-button', toolbar);
  const close = $('.feature-map-close', overlay);
  const setFeatureMode = (open) => {
    body.classList.toggle('feature-mode', open);
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    button.setAttribute('aria-expanded', String(open));
    if (open) close.focus();
    else button.focus();
  };
  button.addEventListener('click', () => setFeatureMode(true));
  close.addEventListener('click', () => setFeatureMode(false));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) setFeatureMode(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setFeatureMode(false); });
}

function fillDemo() {
  const values = {
    'login-email': 'cliente@demo.com', 'login-password': 'demo123',
    'signup-name': 'Marina Costa', 'signup-email': 'marina@demo.com', 'signup-phone': '(61) 99918-2040',
    'signup-password': 'demo123', 'vehicle-model': 'Honda HR-V', 'vehicle-year': '2021',
    'vehicle-plate': 'BRA2E19', 'vehicle-request': 'Revisão preventiva e verificação dos freios.',
    'track-email': 'cliente@demo.com', 'track-password': 'demo123', 'track-plate': 'BRA2E19'
  };
  Object.entries(values).forEach(([id, value]) => { const input = document.getElementById(id); if (input) input.value = value; });
  toast('Dados fictícios preenchidos. Agora você pode continuar.');
}

function initLogin() {
  const form = $('[data-login-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value.trim();
    if (!email || !password) return toast('Preencha e-mail e senha ou use os dados de demonstração.');
    $('[data-login-view]').hidden = true;
    $('[data-customer-dashboard]').hidden = false;
    toast('Acesso demonstrativo realizado com sucesso.');
    $('[data-customer-dashboard]').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('[data-demo-logout]')?.addEventListener('click', () => {
    $('[data-customer-dashboard]').hidden = true;
    $('[data-login-view]').hidden = false;
    toast('Sessão demonstrativa encerrada.');
  });

  const dashboardViews = {
    overview: ['Visão geral', 'As informações mais importantes do seu atendimento.', 'Atualizado há 12 min'],
    vehicles: ['Meus veículos', 'Veículos cadastrados e serviços vinculados ao perfil.', '1 veículo ativo'],
    history: ['Histórico', 'Revisões e solicitações anteriores organizadas em uma linha do tempo.', '3 registros'],
    profile: ['Meu perfil', 'Dados de contato e preferências de comunicação do cliente.', 'Cadastro completo']
  };
  $$('[data-dashboard-nav]').forEach((item) => item.addEventListener('click', () => {
    const [title, description, status] = dashboardViews[item.dataset.dashboardNav];
    $$('[data-dashboard-nav]').forEach((navItem) => navItem.classList.toggle('active', navItem === item));
    $('[data-dashboard-title]').textContent = title;
    $('[data-dashboard-description]').textContent = description;
    $('[data-dashboard-status]').textContent = status;
    toast(`${title}: módulo demonstrativo selecionado.`);
  }));
}

function initSignup() {
  const steps = $$('[data-signup-step]');
  const indicators = $$('[data-step-indicator]');
  let current = 0;
  const show = (index) => {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => { step.hidden = i !== current; });
    indicators.forEach((indicator, i) => indicator.classList.toggle('active', i === current));
  };
  $$('[data-step-next]').forEach((button) => button.addEventListener('click', () => {
    const visible = steps[current];
    const required = $$('[required]', visible);
    if (required.some((field) => !field.value.trim())) return toast('Preencha os campos desta etapa para continuar.');
    show(current + 1);
  }));
  $$('[data-step-back]').forEach((button) => button.addEventListener('click', () => show(current - 1)));
  $('[data-signup-submit]')?.addEventListener('click', () => {
    const required = $$('[required]', steps[current]);
    if (required.some((field) => !field.value.trim())) return toast('Preencha os dados do veículo para enviar.');
    $('[data-signup-form]').hidden = true;
    $('[data-signup-success]').hidden = false;
    toast('Solicitação fictícia criada e enviada à operação.');
  });
  $('[data-signup-reset]')?.addEventListener('click', () => { $('[data-signup-success]').hidden = true; $('[data-signup-form]').hidden = false; show(0); });
  show(0);
}

function jobCard(id, job) {
  return `<button class="job-card" type="button" data-job-id="${id}"><small>${id} · ${job.plate}</small><strong>${job.car}</strong><span>${job.service}</span></button>`;
}

function renderBoard() {
  const labels = { queue: 'Fila', work: 'Em execução', done: 'Concluídos' };
  Object.keys(labels).forEach((stage) => {
    const column = document.querySelector(`[data-board-stage="${stage}"]`);
    if (!column) return;
    const jobs = Object.entries(demoData.jobs).filter(([, job]) => job.stage === stage);
    $('.board-count', column).textContent = jobs.length;
    $('.board-items', column).innerHTML = jobs.map(([id, job]) => jobCard(id, job)).join('') || '<p style="color:#7a8699;font-size:.68rem">Nenhum serviço nesta etapa.</p>';
  });
  $$('[data-job-id]').forEach((card) => card.addEventListener('click', () => openJob(card.dataset.jobId)));
  $('#kpi-queue') && ($('#kpi-queue').textContent = Object.values(demoData.jobs).filter((job) => job.stage === 'queue').length);
  $('#kpi-work') && ($('#kpi-work').textContent = Object.values(demoData.jobs).filter((job) => job.stage === 'work').length);
  $('#kpi-done') && ($('#kpi-done').textContent = Object.values(demoData.jobs).filter((job) => job.stage === 'done').length);
}

function openJob(id) {
  const job = demoData.jobs[id];
  const detail = $('[data-job-detail]');
  if (!job || !detail) return;
  $('[data-detail-id]').textContent = id;
  $('[data-detail-car]').textContent = job.car;
  $('[data-detail-customer]').textContent = job.customer;
  $('[data-detail-plate]').textContent = job.plate;
  $('[data-detail-phone]').textContent = job.phone;
  $('[data-detail-service]').textContent = job.service;
  $('[data-detail-quote]').textContent = job.quote;
  $$('[data-set-stage]', detail).forEach((button) => {
    button.classList.toggle('active', button.dataset.setStage === job.stage);
    button.onclick = () => {
      job.stage = button.dataset.setStage;
      renderBoard();
      openJob(id);
      toast('Etapa atualizada na demonstração.');
    };
  });
  detail.dataset.currentJob = id;
  detail.classList.add('open');
  detail.setAttribute('aria-hidden', 'false');
  $('[data-job-detail-close]', detail)?.focus();
}

function initAdmin() {
  if (!$('[data-admin-board]')) return;
  renderBoard();
  const closeDetail = () => {
    const detail = $('[data-job-detail]');
    detail.classList.remove('open');
    detail.setAttribute('aria-hidden', 'true');
  };
  $('[data-job-detail-close]')?.addEventListener('click', closeDetail);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDetail(); });
  $$('[data-admin-nav]').forEach((item) => item.addEventListener('click', () => {
    $$('[data-admin-nav]').forEach((navItem) => navItem.classList.toggle('active', navItem === item));
    toast(`${item.textContent.trim()}: visão selecionada para esta demonstração.`);
  }));
  $('[data-new-request]')?.addEventListener('click', () => {
    const id = `LC-${1042 + Object.keys(demoData.jobs).length}`;
    demoData.jobs[id] = { customer: 'Novo cliente', car: 'Fiat Pulse 2024', plate: 'DEM0A01', service: 'Avaliação inicial', phone: '(61) 99999-0000', quote: 'Em análise', stage: 'queue' };
    renderBoard();
    openJob(id);
    toast('Nova solicitação fictícia adicionada à fila.');
  });
}

function initTracking() {
  const form = $('[data-tracking-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = ['track-email','track-password','track-plate'].map((id) => document.getElementById(id).value.trim());
    if (values.some((value) => !value)) return toast('Preencha os três campos ou carregue o exemplo.');
    $('[data-tracking-empty]').hidden = true;
    $('[data-tracking-card]').hidden = false;
    toast('Serviço fictício localizado.');
    $('[data-tracking-card]').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('[data-tracking-reset]')?.addEventListener('click', () => {
    $('[data-tracking-card]').hidden = true;
    $('[data-tracking-empty]').hidden = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('demo-system')) return;
  initChrome();
  $$('[data-fill-demo]').forEach((button) => button.addEventListener('click', fillDemo));
  initLogin(); initSignup(); initAdmin(); initTracking();
});
