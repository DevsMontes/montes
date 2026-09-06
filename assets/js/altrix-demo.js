(() => {
  'use strict';

  const widget = document.querySelector('[data-altrix-widget]');
  if (!widget) return;

  const toggle = widget.querySelector('[data-altrix-toggle]');
  const close = widget.querySelector('[data-altrix-close]');
  const panel = widget.querySelector('[data-altrix-panel]');
  const messages = widget.querySelector('[data-altrix-messages]');
  const form = widget.querySelector('[data-altrix-form]');
  const input = widget.querySelector('[data-altrix-input]');
  const status = widget.querySelector('[data-altrix-status]');
  const quickReplies = widget.querySelector('[data-altrix-quick]');
  const endpoint = document.querySelector('meta[name="altrix-api-endpoint"]')?.content || '/api/altrix';
  const history = [];
  let sending = false;

  const setStatus = (label, state = '') => {
    if (!status) return;
    status.className = state;
    status.lastChild.textContent = ` ${label}`;
  };

  const scrollMessages = () => {
    if (messages) messages.scrollTop = messages.scrollHeight;
  };

  const addMessage = (text, role = 'altrix', extraClass = '') => {
    const paragraph = document.createElement('p');
    paragraph.className = `mensagem mensagem-${role}${extraClass ? ` ${extraClass}` : ''}`;
    paragraph.textContent = text;
    messages?.appendChild(paragraph);
    scrollMessages();
    return paragraph;
  };

  const addContacts = () => {
    const contacts = document.createElement('div');
    contacts.className = 'mensagem mensagem-altrix mensagem-contatos';
    [
      ['Falar com Saulo ↗', 'https://wa.me/5561996273004?text=Olá,%20vim%20pelo%20atendimento%20AltriX%20e%20quero%20conversar%20sobre%20um%20projeto.'],
      ['Falar com Arthur ↗', 'https://wa.me/5561992809225?text=Olá,%20vim%20pelo%20atendimento%20AltriX%20e%20quero%20conversar%20sobre%20um%20projeto.']
    ].forEach(([label, href]) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      contacts.appendChild(link);
    });
    messages?.appendChild(contacts);
    scrollMessages();
  };

  const addTyping = () => {
    const typing = document.createElement('div');
    typing.className = 'mensagem mensagem-altrix digitando';
    typing.setAttribute('aria-label', 'AltriX está digitando');
    for (let index = 0; index < 3; index += 1) typing.appendChild(document.createElement('i'));
    messages?.appendChild(typing);
    scrollMessages();
    return typing;
  };

  const setOpen = (open) => {
    if (!panel || !toggle) return;
    panel.hidden = !open;
    panel.classList.toggle('aberto', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar atendimento com a AltriX' : 'Abrir atendimento com a AltriX');
    if (open) window.setTimeout(() => input?.focus(), 160);
  };

  const setSending = (value) => {
    sending = value;
    if (input) input.disabled = value;
    const submit = form?.querySelector('button[type="submit"]');
    if (submit) submit.disabled = value;
    quickReplies?.querySelectorAll('button').forEach((button) => { button.disabled = value; });
  };

  const showFailure = (kind) => {
    const label = kind === 'timeout' ? 'Tempo esgotado' : navigator.onLine ? 'Indisponível' : 'Sem conexão';
    setStatus(label, 'erro');
    addMessage('Nossa atendente inteligente está temporariamente indisponível. Você pode falar diretamente com nossa equipe.', 'altrix', 'mensagem-erro');
    addContacts();
  };

  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text || sending) return;
    setOpen(true);
    addMessage(text, 'pessoa');
    history.push({ role: 'user', content: text });
    if (history.length > 10) history.splice(0, history.length - 10);
    if (input) {
      input.value = '';
      input.style.height = '';
    }
    setSending(true);
    setStatus('Conectando…', 'ocupado');
    const typing = addTyping();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      setStatus('Digitando…', 'ocupado');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.reply !== 'string' || !payload.reply.trim()) throw new Error('Resposta inválida');
      typing.remove();
      const reply = payload.reply.trim();
      addMessage(reply);
      history.push({ role: 'assistant', content: reply });
      if (history.length > 10) history.splice(0, history.length - 10);
      setStatus('Disponível');
    } catch (error) {
      typing.remove();
      showFailure(error?.name === 'AbortError' ? 'timeout' : 'offline');
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
      input?.focus();
    }
  };

  toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  close?.addEventListener('click', () => setOpen(false));
  document.querySelectorAll('[data-open-altrix]').forEach((button) => button.addEventListener('click', () => setOpen(true)));
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input?.value || '');
  });
  quickReplies?.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => sendMessage(button.textContent || '')));
  input?.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 96)}px`;
  });
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form?.requestSubmit();
    }
  });
  window.addEventListener('offline', () => setStatus('Sem conexão', 'erro'));
  window.addEventListener('online', () => setStatus('Disponível'));
})();
