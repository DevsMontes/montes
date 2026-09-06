const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 8;
const PROVIDER_TIMEOUT_MS = 9_000;
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 10;
const MAX_TOTAL_LENGTH = 4_000;
const requestsByAddress = new Map();

const SYSTEM_PROMPT = `Você é AltriX, atendente virtual da Montes.dev, um estúdio brasileiro de design e desenvolvimento.

Converse sempre em português do Brasil, de forma clara, humana, breve e profissional. Sua função é entender a necessidade da pessoa, ajudar a organizá-la e indicar o próximo passo com a equipe da Montes.dev.

A Montes.dev cria sites, sistemas sob medida, automações, integrações, experiências digitais e soluções com inteligência artificial.

Ao longo da conversa, descubra naturalmente, sem repetir o que já foi informado:
- qual é o tipo de empresa ou atividade;
- o que a pessoa deseja criar, melhorar ou automatizar;
- se já existe algum site, sistema ou ferramenta envolvida.

Faça no máximo duas perguntas por resposta. Não invente preços, clientes, números, prazos, resultados, portfólio, tecnologias usadas ou funcionalidades. Não prometa orçamento nem prazo. Quando houver contexto suficiente ou a pessoa pedir proposta, orçamento, prazo ou atendimento humano, convide-a a falar com Saulo ou Arthur pelos botões de contato disponíveis no atendimento. Não diga que realizou ações externas. Se não souber algo, seja transparente.`;

const json = (payload, status = 200, extraHeaders = {}) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders }
});

const allowedOrigin = (request, env) => {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const ownOrigin = new URL(request.url).origin;
  if (origin === ownOrigin || origin === env.ALTRIX_ALLOWED_ORIGIN) return origin;
  return false;
};

const corsHeaders = (origin) => origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' } : {};

const rateLimited = (request) => {
  const now = Date.now();
  const address = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'desconhecido';
  const recent = (requestsByAddress.get(address) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  requestsByAddress.set(address, recent);
  if (requestsByAddress.size > 1_000) {
    for (const [key, times] of requestsByAddress) {
      if (!times.some((time) => now - time < RATE_WINDOW_MS)) requestsByAddress.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
};

const validateMessages = (input) => {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_MESSAGES) return null;
  let totalLength = 0;
  const messages = [];
  for (const item of input) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null;
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return null;
    totalLength += content.length;
    if (totalLength > MAX_TOTAL_LENGTH) return null;
    messages.push({ role: item.role, content });
  }
  if (messages.at(-1)?.role !== 'user') return null;
  return messages;
};

const handleAltrix = async (request, env) => {
  const origin = allowedOrigin(request, env);
  if (origin === false) return json({ error: 'Origem não permitida.' }, 403);
  const headers = corsHeaders(origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, headers);
  if (!env.GROQ_API_KEY) return json({ error: 'Atendimento temporariamente indisponível.' }, 503, headers);
  if (rateLimited(request)) return json({ error: 'Muitas solicitações. Tente novamente em instantes.' }, 429, { ...headers, 'Retry-After': '60' });

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Conteúdo inválido.' }, 400, headers); }
  const messages = validateMessages(body?.messages);
  if (!messages) return json({ error: 'Conversa inválida.' }, 400, headers);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const providerResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-oss-20b', messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages], temperature: 0.35, max_completion_tokens: 360 }),
      signal: controller.signal
    });
    if (!providerResponse.ok) return json({ error: 'Atendimento temporariamente indisponível.' }, 502, headers);
    const providerData = await providerResponse.json();
    const reply = providerData?.choices?.[0]?.message?.content?.trim();
    if (!reply || typeof reply !== 'string') return json({ error: 'Resposta inválida do atendimento.' }, 502, headers);
    return json({ reply: reply.slice(0, 2_000) }, 200, headers);
  } catch (error) {
    return json({ error: error?.name === 'AbortError' ? 'Tempo de resposta esgotado.' : 'Atendimento temporariamente indisponível.' }, 504, headers);
  } finally { clearTimeout(timeout); }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/altrix') return handleAltrix(request, env);
    if (env.ASSETS?.fetch) return env.ASSETS.fetch(request);
    return new Response('Página não encontrada.', { status: 404 });
  }
};
