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
      <div class="feature-map-head"><div><span>Mapa interativo</span><small>${String(targets.length).padStart(2, '0')} pontos da experiência</small></div><button class="feature-map-close" type="button" aria-label="Fechar mapa"><i></i><i></i></button></div>
      <div class="feature-map-layout">
        <div class="feature-map-intro">
          <p class="feature-map-kicker">Por dentro do produto</p>
          <h2 id="feature-map-title">Explore cada decisão da interface.</h2>
          <p>Escolha um item para ir diretamente até ele e entender o valor que entrega ao usuário.</p>
          <div class="feature-map-hint"><span>↘</span><small>Toque em uma funcionalidade<br>para destacá-la na tela.</small></div>
        </div>
        <ol class="feature-tree">${targets.map((target, index) => {
        const [name, detail = 'Funcionalidade demonstrativa adaptável ao projeto.'] = (target.dataset.feature || '').split('|');
        return `<li><button type="button" data-feature-jump="${index}"><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${name}</strong><small>${detail}</small></div><i aria-hidden="true">↗</i></button></li>`;
      }).join('')}</ol>
      </div>
      <div class="feature-map-foot"><span>Montes Developers · Product walkthrough</span><small>ESC para fechar</small></div>
    </aside>`;
  body.append(overlay);

  const button = $('.demo-feature-button', toolbar);
  const close = $('.feature-map-close', overlay);
  const setFeatureMode = (open, restoreFocus = true) => {
    body.classList.toggle('feature-mode', open);
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    button.setAttribute('aria-expanded', String(open));
    if (open) close.focus();
    else if (restoreFocus) button.focus();
  };
  button.addEventListener('click', () => setFeatureMode(true));
  close.addEventListener('click', () => setFeatureMode(false));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) setFeatureMode(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setFeatureMode(false); });

  const featureJumps = $$('[data-feature-jump]', overlay);
  featureJumps.forEach((item) => item.addEventListener('click', () => {
    const target = targets[Number(item.dataset.featureJump)];
    if (!target) return;
    const [name] = (target.dataset.feature || 'Funcionalidade').split('|');
    setFeatureMode(false, false);
    document.dispatchEvent(new CustomEvent('demo:feature-jump', { detail: { target } }));
    $$('.feature-spotlight').forEach((element) => element.classList.remove('feature-spotlight'));
    target.classList.add('feature-spotlight');
    target.setAttribute('tabindex', '-1');
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      target.focus({ preventScroll: true });
    }, 120);
    window.setTimeout(() => target.classList.remove('feature-spotlight'), 3600);
    toast(`${String(Number(item.dataset.featureJump) + 1).padStart(2, '0')} · ${name}`);
  }));
  overlay.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const current = featureJumps.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      featureJumps[(current + direction + featureJumps.length) % featureJumps.length].focus();
    }
    if (event.key === 'Tab') {
      const focusable = [close, ...featureJumps];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
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
    overview: {
      head: ['Visão geral', 'As informações mais importantes do seu atendimento.', 'Atualizado há 12 min'],
      metrics: [['Status atual','Em diagnóstico'],['Previsão','Hoje, 17h'],['Orçamento','R$ 860,00']],
      card: '<h3>Honda HR-V · BRA2E19</h3><p>Revisão preventiva e verificação do sistema de freios.</p><div class="timeline"><div class="timeline-step done">Recebido</div><div class="timeline-step done">Triagem</div><div class="timeline-step active">Diagnóstico</div><div class="timeline-step">Finalizado</div></div><div class="tracking-note"><strong>Atualização da equipe</strong><p>O diagnóstico foi iniciado. Enviaremos a aprovação do orçamento assim que a avaliação estiver concluída.</p></div>'
    },
    vehicles: {
      head: ['Meus veículos', 'Veículos cadastrados e serviços vinculados ao perfil.', '1 veículo ativo'],
      metrics: [['Veículo principal','Honda HR-V'],['Ano','2021'],['Placa','BRA2E19']],
      card: '<div class="demo-detail-visual"><span>HR-V</span><div><small>Veículo ativo</small><h3>Honda HR-V 2021</h3><p>Última revisão em 28 de agosto · 42.860 km</p></div></div><div class="demo-inline-actions"><button type="button">Ver histórico</button><button type="button">Solicitar serviço</button></div>'
    },
    history: {
      head: ['Histórico', 'Revisões e solicitações anteriores organizadas em uma linha do tempo.', '3 registros'],
      metrics: [['Serviços realizados','03'],['Investimento total','R$ 2.140'],['Próxima revisão','10.000 km']],
      card: '<h3>Histórico recente</h3><div class="demo-history"><div><span>28 AGO</span><p><strong>Revisão preventiva</strong><small>Em andamento · LC-1042</small></p><b>R$ 860</b></div><div><span>14 MAR</span><p><strong>Troca de óleo</strong><small>Concluído · LC-0968</small></p><b>R$ 420</b></div><div><span>02 JAN</span><p><strong>Alinhamento</strong><small>Concluído · LC-0911</small></p><b>R$ 260</b></div></div>'
    },
    profile: {
      head: ['Meu perfil', 'Dados de contato e preferências de comunicação do cliente.', 'Cadastro completo'],
      metrics: [['Cliente desde','2023'],['Atendimentos','05'],['Canal preferido','WhatsApp']],
      card: '<h3>Marina Costa</h3><p>cliente@demo.com · (61) 99918-2040</p><div class="demo-profile-grid"><div><small>Notificações</small><strong>WhatsApp e e-mail</strong></div><div><small>Oficina preferida</small><strong>Lima Car · Asa Norte</strong></div></div><button class="secondary-action demo-profile-action" type="button">Editar preferências</button>'
    }
  };
  $$('[data-dashboard-nav]').forEach((item) => item.addEventListener('click', () => {
    const view = dashboardViews[item.dataset.dashboardNav];
    const [title, description, status] = view.head;
    $$('[data-dashboard-nav]').forEach((navItem) => navItem.classList.toggle('active', navItem === item));
    $('[data-dashboard-title]').textContent = title;
    $('[data-dashboard-description]').textContent = description;
    $('[data-dashboard-status]').textContent = status;
    $('.summary-grid').innerHTML = view.metrics.map(([label, value]) => `<div class="summary-card"><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('.service-card-demo').innerHTML = view.card;
    $('.dashboard-main').classList.remove('view-switch');
    void $('.dashboard-main').offsetWidth;
    $('.dashboard-main').classList.add('view-switch');
    toast(`${title}: módulo demonstrativo selecionado.`);
  }));
  document.addEventListener('demo:feature-jump', (event) => {
    if (!event.detail.target.closest('[data-customer-dashboard]')) return;
    $('[data-login-view]').hidden = true;
    $('[data-customer-dashboard]').hidden = false;
  });
}

function initSignup() {
  const steps = $$('[data-signup-step]');
  const indicators = $$('[data-step-indicator]');
  let current = 0;
  const show = (index) => {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => { step.hidden = i !== current; });
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === current);
      indicator.classList.toggle('completed', i < current);
      indicator.setAttribute('aria-current', i === current ? 'step' : 'false');
    });
    steps[current]?.classList.remove('step-enter');
    void steps[current]?.offsetWidth;
    steps[current]?.classList.add('step-enter');
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
  document.addEventListener('demo:feature-jump', (event) => {
    const stepIndex = steps.indexOf(event.detail.target);
    if (stepIndex >= 0) {
      $('[data-signup-success]').hidden = true;
      $('[data-signup-form]').hidden = false;
      show(stepIndex);
    }
    if (event.detail.target.matches('[data-signup-success]')) {
      $('[data-signup-form]').hidden = true;
      $('[data-signup-success]').hidden = false;
    }
  });
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
  const adminContent = $('.admin-content');
  const adminTop = $('.admin-top', adminContent);
  const adminCore = [$('.kpi-grid', adminContent), $('.board', adminContent)];
  const extraView = document.createElement('div');
  extraView.className = 'admin-view-card';
  extraView.hidden = true;
  adminContent.append(extraView);
  const adminViews = {
    'Clientes': ['Clientes ativos','Organize relacionamento, veículos e histórico em um só lugar.','<div class="admin-list"><div><span>MC</span><p><strong>Marina Costa</strong><small>Honda HR-V · 5 serviços</small></p><b>Ativa</b></div><div><span>RM</span><p><strong>Rafael Mendes</strong><small>Toyota Corolla · 3 serviços</small></p><b>Ativo</b></div><div><span>CR</span><p><strong>Camila Rocha</strong><small>Jeep Renegade · 4 serviços</small></p><b>Ativa</b></div></div>'],
    'Agenda': ['Agenda da equipe','Distribua horários e responsáveis sem perder o contexto.','<div class="agenda-grid"><div><span>09:00</span><strong>Marina · HR-V</strong><small>Revisão preventiva</small></div><div><span>11:30</span><strong>Rafael · Corolla</strong><small>Diagnóstico eletrônico</small></div><div><span>14:00</span><strong>Novo encaixe</strong><small>Horário disponível</small></div></div>'],
    'Relatórios': ['Relatórios','Transforme a rotina da operação em decisões mais claras.','<div class="report-grid"><div><span>Conversão</span><strong>68%</strong><i style="--value:68%"></i></div><div><span>Ticket médio</span><strong>R$ 890</strong><i style="--value:82%"></i></div><div><span>Satisfação</span><strong>4,9/5</strong><i style="--value:96%"></i></div></div>']
  };
  $$('[data-admin-nav]').forEach((item) => item.addEventListener('click', () => {
    $$('[data-admin-nav]').forEach((navItem) => navItem.classList.toggle('active', navItem === item));
    const label = item.textContent.trim();
    const showCore = label === 'Visão geral' || label === 'Atendimentos';
    adminCore.forEach((element) => { element.hidden = !showCore; });
    extraView.hidden = showCore;
    if (showCore) {
      $('h2', adminTop).textContent = label === 'Visão geral' ? 'Painel de serviços' : 'Atendimentos em andamento';
      $('p', adminTop).textContent = label === 'Visão geral' ? 'Sexta-feira, 28 de agosto · Dados exclusivamente demonstrativos' : 'Acompanhe prioridades, responsáveis e evolução da fila.';
    } else {
      const [title, description, content] = adminViews[label];
      $('h2', adminTop).textContent = title;
      $('p', adminTop).textContent = description;
      extraView.innerHTML = content;
      extraView.classList.remove('view-switch');
      void extraView.offsetWidth;
      extraView.classList.add('view-switch');
    }
    toast(`${label}: visão selecionada para esta demonstração.`);
  }));
  $('[data-new-request]')?.addEventListener('click', () => {
    const id = `LC-${1042 + Object.keys(demoData.jobs).length}`;
    demoData.jobs[id] = { customer: 'Novo cliente', car: 'Fiat Pulse 2024', plate: 'DEM0A01', service: 'Avaliação inicial', phone: '(61) 99999-0000', quote: 'Em análise', stage: 'queue' };
    renderBoard();
    openJob(id);
    toast('Nova solicitação fictícia adicionada à fila.');
  });
  document.addEventListener('demo:feature-jump', (event) => {
    if (event.detail.target.closest('[data-job-detail]')) openJob(Object.keys(demoData.jobs)[0]);
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
  document.addEventListener('demo:feature-jump', (event) => {
    if (!event.detail.target.closest('[data-tracking-card]')) return;
    $('[data-tracking-empty]').hidden = true;
    $('[data-tracking-card]').hidden = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('demo-system')) return;
  initChrome();
  $$('[data-fill-demo]').forEach((button) => button.addEventListener('click', fillDemo));
  initLogin(); initSignup(); initAdmin(); initTracking();
  $$('.primary-action,.secondary-action,.demo-example-button,.demo-feature-button').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.remove('button-pop');
      void button.offsetWidth;
      button.classList.add('button-pop');
      window.setTimeout(() => button.classList.remove('button-pop'), 420);
    });
  });
});
