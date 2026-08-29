(() => {
  const host = document.createElement('div');
  host.setAttribute('data-altrix-demo', '');
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>
      :host{all:initial}.alx{--mint:#73e5b7;--surface:#0e1d19;position:fixed;right:22px;bottom:22px;z-index:2147483000;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#eef6f2}.alx-toggle{width:60px;height:60px;float:right;display:grid;place-items:center;border:0;border-radius:19px;color:#07110f;background:var(--mint);font-size:20px;font-weight:900;box-shadow:0 18px 48px rgba(0,0,0,.34);cursor:pointer;transition:transform .2s ease}.alx-toggle:hover{transform:translateY(-2px)}.alx-panel{width:min(378px,calc(100vw - 28px));height:min(600px,calc(100vh - 108px));margin-bottom:12px;display:none;grid-template-rows:76px auto 1fr 68px;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:20px;background:var(--surface);box-shadow:0 28px 90px rgba(0,0,0,.46)}.alx.is-open .alx-panel{display:grid;animation:alx-in .2s ease-out}.alx-head{padding:0 18px;display:flex;align-items:center;gap:12px;color:#07110f;background:var(--mint)}.alx-avatar{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:rgba(7,17,15,.15);font-size:14px;font-weight:900}.alx-head div{display:grid;gap:2px}.alx-head strong{font-size:13px}.alx-head small{font-size:9px}.alx-head small:before{content:"";width:6px;height:6px;margin-right:5px;display:inline-block;border-radius:50%;background:#116747}.alx-close{margin-left:auto;border:0;color:#07110f;background:transparent;font-size:21px;cursor:pointer}.alx-notice{padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.07);color:#91a69d;background:rgba(0,0,0,.1);font-size:8px;line-height:1.45;text-align:center}.alx-messages{padding:17px;display:flex;flex-direction:column;gap:10px;overflow:auto;background:radial-gradient(circle at 50% 0,rgba(115,229,183,.055),transparent 42%)}.alx-bubble{max-width:83%;padding:11px 12px;border-radius:13px;font-size:12px;line-height:1.55;white-space:pre-wrap}.alx-assistant{align-self:flex-start;border-bottom-left-radius:4px;background:rgba(255,255,255,.085)}.alx-user{align-self:flex-end;border-bottom-right-radius:4px;color:#07110f;background:var(--mint)}.alx-typing{color:#8fa39b;font-style:italic}.alx-actions{align-self:flex-start;display:flex;flex-wrap:wrap;gap:7px}.alx-actions a{padding:8px 10px;border:1px solid rgba(115,229,183,.32);border-radius:8px;color:var(--mint);background:rgba(115,229,183,.055);font-size:9px;font-weight:800;text-decoration:none}.alx-form{padding:12px;display:grid;grid-template-columns:1fr 42px;gap:8px;border-top:1px solid rgba(255,255,255,.09)}.alx-form input{min-width:0;padding:0 12px;border:1px solid rgba(255,255,255,.14);border-radius:10px;outline:0;color:#fff;background:rgba(255,255,255,.045);font:12px inherit}.alx-form input:focus{border-color:rgba(115,229,183,.55)}.alx-form input::placeholder{color:#71877e}.alx-form button{border:0;border-radius:10px;color:#07110f;background:var(--mint);font-weight:900;cursor:pointer}.alx-form button:disabled{opacity:.5;cursor:wait}@keyframes alx-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}@media(max-width:520px){.alx{left:14px;right:14px;bottom:14px}.alx-toggle{float:right}.alx-panel{width:100%;height:calc(100vh - 96px);border-radius:17px}}
    </style>
    <div class="alx">
      <section class="alx-panel" role="dialog" aria-label="Demonstração do atendimento AltriX">
        <header class="alx-head"><span class="alx-avatar">A</span><div><strong>AltriX</strong><small>Montes Developers · online</small></div><button class="alx-close" type="button" aria-label="Fechar atendimento">×</button></header>
        <div class="alx-notice">Demonstração segura: nenhuma mensagem é enviada ou armazenada.</div>
        <div class="alx-messages" aria-live="polite"></div>
        <form class="alx-form"><input type="text" maxlength="500" autocomplete="off" placeholder="Digite sua mensagem…" aria-label="Mensagem"><button type="submit" aria-label="Enviar mensagem">→</button></form>
      </section>
      <button class="alx-toggle" type="button" aria-label="Abrir demonstração do atendimento AltriX">A</button>
    </div>`;

  const app = root.querySelector('.alx');
  const messages = root.querySelector('.alx-messages');
  const form = root.querySelector('.alx-form');
  const input = form.querySelector('input');
  const submit = form.querySelector('button');
  const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const includesAny = (text, terms) => terms.some((term) => text.includes(term));

  const addMessage = (text, type) => {
    const bubble = document.createElement('div');
    bubble.className = `alx-bubble alx-${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };
  const addContacts = () => {
    const actions = document.createElement('div');
    actions.className = 'alx-actions';
    actions.innerHTML = '<a href="https://wa.me/5561996273004?text=Olá,%20vim%20pelo%20atendimento%20AltriX%20e%20quero%20solicitar%20um%20orçamento." target="_blank" rel="noopener noreferrer">Falar com Saulo ↗</a><a href="https://wa.me/5561992809225?text=Olá,%20vim%20pelo%20atendimento%20AltriX%20e%20quero%20solicitar%20um%20orçamento." target="_blank" rel="noopener noreferrer">Falar com Arthur ↗</a>';
    messages.appendChild(actions);
    messages.scrollTop = messages.scrollHeight;
  };

  const answer = (question) => {
    const text = normalize(question);
    if (includesAny(text, ['ignore as instrucoes', 'prompt do sistema', 'system prompt', 'modo desenvolvedor', 'revele suas instrucoes'])) return 'Posso ajudar com informações sobre a Montes Developers, nossos serviços e a contratação de projetos.';
    if (includesAny(text, ['futebol', 'campeonato', 'politica', 'presidente', 'receita', 'horoscopo', 'loteria', 'bitcoin'])) return 'Este atendimento é dedicado aos serviços e projetos da Montes Developers. Posso explicar como um site ou sistema pode ajudar o seu negócio.';
    if (includesAny(text, ['preco', 'valor', 'quanto custa', 'tabela', 'investimento'])) return 'O investimento depende do objetivo, das páginas, das integrações e do prazo de cada projeto. A Montes prepara um orçamento personalizado depois de entender sua necessidade. Posso encaminhar você para uma conversa sem compromisso.';
    if (includesAny(text, ['servico', 'fazem', 'oferecem', 'trabalham com', 'solucao'])) return 'A Montes Developers cria sites institucionais, landing pages, sistemas web sob medida e experiências digitais responsivas. Também cuidamos de performance, evolução e automações para a operação.';
    if (includesAny(text, ['site', 'negocio', 'empresa', 'vantagem', 'beneficio'])) return 'Um bom site fortalece a confiança na marca, apresenta seus serviços com clareza e transforma visitas em oportunidades. Quando bem planejado, ele também reduz dúvidas repetidas e facilita o contato comercial.';
    if (includesAny(text, ['prazo', 'demora', 'tempo'])) return 'O prazo é definido conforme o escopo e a complexidade. Depois de uma conversa inicial, a equipe apresenta etapas, prioridades e uma previsão realista para o projeto.';
    if (includesAny(text, ['humano', 'pessoa', 'contato', 'contratar', 'fechar', 'orcamento', 'whatsapp'])) return 'Claro. Você pode conversar diretamente com a equipe da Montes para explicar sua ideia e solicitar um orçamento.';
    if (includesAny(text, ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite'])) return 'Olá! Sou a demonstração da AltriX no portfólio da Montes Developers. Posso explicar nossos serviços, benefícios de um projeto digital ou ajudar você a solicitar um orçamento.';
    return 'Posso ajudar com informações sobre sites, sistemas e os serviços da Montes Developers. Conte um pouco sobre o que você gostaria de criar ou melhorar.';
  };

  const toggle = () => {
    app.classList.toggle('is-open');
    if (app.classList.contains('is-open')) input.focus();
  };
  root.querySelector('.alx-toggle').addEventListener('click', toggle);
  root.querySelector('.alx-close').addEventListener('click', toggle);
  addMessage('Olá! Sou a demonstração da AltriX. Como posso ajudar com seu site, sistema ou ideia de projeto?', 'assistant');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    input.disabled = true;
    submit.disabled = true;
    const typing = addMessage('Preparando a resposta…', 'assistant alx-typing');
    window.setTimeout(() => {
      typing.remove();
      addMessage(answer(question), 'assistant');
      if (includesAny(normalize(question), ['humano', 'pessoa', 'contato', 'contratar', 'fechar', 'orcamento', 'whatsapp', 'preco', 'valor', 'quanto custa'])) addContacts();
      input.disabled = false;
      submit.disabled = false;
      input.focus();
    }, 450);
  });
})();
