(() => {
  const stylesheet = new URL(
    "../css/altrix-portfolio.css",
    document.currentScript.src,
  ).href;
  const host = document.createElement("div");
  host.setAttribute("data-altrix-demo", "");
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
    <link rel="stylesheet" href="${stylesheet}">
    <div class="alx">
      <dialog class="alx-panel" aria-label="Demonstração do atendimento AltriX">
        <header class="alx-head"><span class="alx-avatar">A</span><div><strong>AltriX</strong><small>Montes Developers · demo local</small></div><button class="alx-close" type="button" aria-label="Fechar atendimento">×</button></header>
        <div class="alx-notice">Respostas predefinidas. Nenhuma mensagem é enviada ou armazenada.</div>
        <div class="alx-messages" role="log" aria-label="Conversa demonstrativa" aria-live="polite"></div>
        <form class="alx-form"><input type="text" maxlength="500" autocomplete="off" placeholder="Digite sua mensagem…" aria-label="Mensagem"><button type="submit" aria-label="Testar resposta local">→</button></form>
      </dialog>
      <button class="alx-toggle" type="button" aria-label="Abrir demonstração do atendimento AltriX" aria-expanded="false">AltriX ↗</button>
    </div>`;

  const messages = root.querySelector(".alx-messages");
  const form = root.querySelector(".alx-form");
  const input = form.querySelector("input");
  const normalize = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const includesAny = (text, terms) =>
    terms.some((term) => text.includes(term));

  const addMessage = (text, type) => {
    const bubble = document.createElement("div");
    bubble.className = `alx-bubble alx-${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };
  const addContacts = () => {
    const actions = document.createElement("div");
    actions.className = "alx-actions";
    actions.innerHTML =
      '<a href="https://wa.me/5561996273004?text=Olá,%20vim%20pelo%20atendimento%20AltriX%20e%20quero%20solicitar%20um%20orçamento." target="_blank" rel="noopener noreferrer">Falar com Saulo ↗</a><a href="https://wa.me/5561992809225?text=Olá,%20vim%20pelo%20atendimento%20AltriX%20e%20quero%20solicitar%20um%20orçamento." target="_blank" rel="noopener noreferrer">Falar com Arthur ↗</a>';
    messages.appendChild(actions);
    messages.scrollTop = messages.scrollHeight;
  };

  const answer = (question) => {
    const text = normalize(question);
    if (
      includesAny(text, [
        "ignore as instrucoes",
        "prompt do sistema",
        "system prompt",
        "modo desenvolvedor",
        "revele suas instrucoes",
      ])
    )
      return "Posso ajudar com informações sobre a Montes Developers, nossos serviços e a contratação de projetos.";
    if (
      includesAny(text, [
        "futebol",
        "campeonato",
        "politica",
        "presidente",
        "receita",
        "horoscopo",
        "loteria",
        "bitcoin",
      ])
    )
      return "Este atendimento é dedicado aos serviços e projetos da Montes Developers. Posso explicar como um site ou sistema pode ajudar o seu negócio.";
    if (
      includesAny(text, [
        "preco",
        "valor",
        "quanto custa",
        "tabela",
        "investimento",
      ])
    )
      return "O investimento depende do objetivo, das páginas, das integrações e do prazo de cada projeto. A Montes prepara um orçamento personalizado depois de entender sua necessidade. Posso encaminhar você para uma conversa sem compromisso.";
    if (
      includesAny(text, [
        "servico",
        "fazem",
        "oferecem",
        "trabalham com",
        "solucao",
      ])
    )
      return "A Montes Developers cria sites institucionais, landing pages, sistemas web sob medida e experiências digitais responsivas. Também cuidamos de performance, evolução e automações para a operação.";
    if (
      includesAny(text, ["site", "negocio", "empresa", "vantagem", "beneficio"])
    )
      return "Um bom site fortalece a confiança na marca, apresenta seus serviços com clareza e transforma visitas em oportunidades. Quando bem planejado, ele também reduz dúvidas repetidas e facilita o contato comercial.";
    if (includesAny(text, ["prazo", "demora", "tempo"]))
      return "O prazo é definido conforme o escopo e a complexidade. Depois de uma conversa inicial, a equipe apresenta etapas, prioridades e uma previsão realista para o projeto.";
    if (
      includesAny(text, [
        "humano",
        "pessoa",
        "contato",
        "contratar",
        "fechar",
        "orcamento",
        "whatsapp",
      ])
    )
      return "Claro. Você pode conversar diretamente com a equipe da Montes para explicar sua ideia e solicitar um orçamento.";
    if (includesAny(text, ["oi", "ola", "bom dia", "boa tarde", "boa noite"]))
      return "Olá! Sou a demonstração da AltriX no portfólio da Montes Developers. Posso explicar nossos serviços, benefícios de um projeto digital ou ajudar você a solicitar um orçamento.";
    return "Posso ajudar com informações sobre sites, sistemas e os serviços da Montes Developers. Conte um pouco sobre o que você gostaria de criar ou melhorar.";
  };

  const panel = root.querySelector(".alx-panel");
  const launcher = root.querySelector(".alx-toggle");
  let lastTrigger = launcher;
  const open = (trigger = launcher) => {
    if (panel.open) return;
    lastTrigger = trigger;
    panel.showModal();
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  };
  const close = () => panel.close();
  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [...panel.querySelectorAll("button,a[href],input")];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && root.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && root.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  launcher.addEventListener("click", () => open());
  root.querySelector(".alx-close").addEventListener("click", close);
  panel.addEventListener("close", () => {
    launcher.setAttribute("aria-expanded", "false");
    lastTrigger.focus({ preventScroll: true });
  });
  document.addEventListener("altrix:open", (event) =>
    open(event.detail?.trigger || launcher),
  );
  addMessage(
    "Olá! Sou a demonstração da AltriX. Como posso ajudar com seu site, sistema ou ideia de projeto?",
    "assistant",
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, "user");
    input.value = "";
    addMessage(answer(question), "assistant");
    if (
      includesAny(normalize(question), [
        "humano",
        "pessoa",
        "contato",
        "contratar",
        "fechar",
        "orcamento",
        "whatsapp",
        "preco",
        "valor",
        "quanto custa",
      ])
    )
      addContacts();
    input.focus();
  });
})();
