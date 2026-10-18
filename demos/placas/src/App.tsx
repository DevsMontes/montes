import { appBase, demoPath } from "./paths";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Product, QR } from "./components/Product";
import Experience, { Refs } from "./components/Experience";
import { Briefing, Cart } from "./components/Commerce";
import {
  addItem,
  cartTotals,
  money,
  products,
  readCart,
  type CartItem,
  type Finish,
  type Model,
} from "./lib";
import {
  claims,
  initialPersonalization,
  sources,
  suggestions,
} from "./data/content";
const Simulators = lazy(() => import("./components/Simulators"));
const faq = [
  [
    "Funciona em qualquer celular?",
    "Não. NFC requer hardware compatível, configurações adequadas e condições de leitura do sistema. Uma notificação ou confirmação pode ser necessária. A experiência varia por aparelho.",
    "T01,T02",
  ],
  [
    "E se o celular não tiver NFC?",
    "O QR oferece outro caminho em aparelhos que conseguem lê-lo pela câmera. Nesta demonstração, o código abre uma página do próprio site. Nenhuma permissão de câmera ou NFC é solicitada.",
    "G01",
  ],
  [
    "Precisa de internet ou de login?",
    "É necessária internet para acessar o destino do link. Para publicar uma avaliação no Google, o cliente precisa entrar em uma Conta do Google. Aproximar o celular não publica uma avaliação.",
    "G02",
  ],
  [
    "Como o link seria configurado?",
    "Em uma implantação real, o link de avaliação do estabelecimento seria obtido no Perfil da Empresa, conferido e configurado no QR e na tag NFC com URL NDEF compatível. Neste conceito, o destino é apenas a nossa rota demonstrativa.",
    "G01,T01,T02",
  ],
  [
    "A placa garante avaliações ou posição na busca?",
    "Não. Ela oferece um convite físico e um caminho até o link. A decisão de avaliar pertence ao cliente. A busca local considera relevância, distância e destaque; NFC não é um fator de SEO.",
    "G03",
  ],
  [
    "Posso convidar somente quem gostou?",
    "O convite deve aceitar opiniões honestas de todos. Não selecione apenas clientes satisfeitos, não peça cinco estrelas e não ofereça descontos, brindes ou vantagens por uma avaliação.",
    "G04",
  ],
  [
    "O produto e a compra são reais?",
    "Não. Materiais, medidas, preços, frete e prazo são ilustrativos. A representação é um conceito vetorial, sem validação de fabricação. O checkout não cobra, não coleta cartão e não cria um pedido comercial.",
    "",
  ],
];
function Brand() {
  return (
    <a href="#inicio" className="brand" aria-label="Montes, início">
      <b>montes</b>
      <span>OBJETOS DE CONEXÃO</span>
    </a>
  );
}
function DemoPage() {
  return (
    <div className="demo-page">
      <header>
        <a href={appBase} className="brand">
          <b>montes</b>
          <span>OBJETOS DE CONEXÃO</span>
        </a>
        <span className="eyebrow">DEMONSTRAÇÃO</span>
      </header>
      <main>
        <span className="eyebrow">VOCÊ CHEGOU PELO CONVITE</span>
        <h1>
          A experiência
          <br />é sua.
          <br />
          <em>A escolha também.</em>
        </h1>
        <p>
          Este QR levou você a uma página demonstrativa da Montes. Em um uso
          real, o convite poderia levar ao link de avaliações de um
          estabelecimento.
        </p>
        <div className="notice">
          Nenhuma avaliação foi publicada. Não há integração com o Google nem
          registro de uma avaliação concluída.
        </div>
        <p>
          Publicar uma opinião exige uma ação sua e login em uma Conta do
          Google. Todos os relatos honestos são bem-vindos.
        </p>
        <a href={appBase} className="button">
          Voltar à apresentação <span>↗</span>
        </a>
        <a className="text-link" href={`${appBase}#fontes`}>
          Consultar fontes e metodologia
        </a>
      </main>
      <footer>
        Projeto demonstrativo de e-commerce criado pela Montes Developers
      </footer>
    </div>
  );
}
export default function App() {
  const [finish, setFinish] = useState<Finish>("Preto");
  const [name, setName] = useState(initialPersonalization.name);
  const [message, setMessage] = useState(initialPersonalization.message);
  const [view, setView] = useState("front");
  const [model, setModel] = useState<Model>("mesa");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return readCart(localStorage.getItem("montes-cart-v1"));
    } catch {
      return [];
    }
  });
  const [modal, setModal] = useState<"cart" | "briefing" | null>(null);
  const [toast, setToast] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion
      ? "reduce"
      : "system";
  }, [reduceMotion]);
  const hero = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem("montes-cart-v1", JSON.stringify(cart));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [cart]);
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => setPastHero(!e.isIntersecting),
      { threshold: 0 },
    );
    if (hero.current) o.observe(hero.current);
    return () => o.disconnect();
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  function notify(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }
  function reset() {
    setCart([]);
    setFinish("Preto");
    setName(initialPersonalization.name);
    setMessage(initialPersonalization.message);
    setQuantity(1);
    setModel("mesa");
    setView("front");
    setResetKey((k) => k + 1);
  }
  if (location.pathname.replace(/\/$/, "") === demoPath.replace(/\/$/, ""))
    return <DemoPage />;
  const selected = products.find((p) => p.id === model)!;
  const totals = cartTotals(cart);
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular ao conteúdo
      </a>
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegação principal">
          <a href="#objeto">O objeto</a>
          <a href="#experiencia">A experiência</a>
          <a href="#possibilidades">Possibilidades</a>
          {pastHero && (
            <button
              onClick={() => setModal("cart")}
              className="bag-button"
              aria-label={`Abrir carrinho, ${totals.items} itens`}
            >
              Sacola <span>{totals.items.toString().padStart(2, "0")}</span>
            </button>
          )}
        </nav>
      </header>
      <main id="conteudo">
        <section className="hero" id="inicio" ref={hero}>
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> DESIGN QUE APROXIMA
            </span>
            <h1>
              Um pequeno gesto.
              <br />
              <em>
                Uma experiência
                <br />
                compartilhada.
              </em>
            </h1>
            <p>
              Placas com NFC e QR Code para convidar
              <br className="desktop-break" /> seus clientes a contar como foi.
            </p>
            <div className="scroll-cue">
              <span>↓</span> UM CONVITE PARA DESCOBRIR
            </div>
          </div>
          <div className="hero-scene">
            <div className="hero-light" />
            <div className="hero-horizon" />
            <div className="hero-plinth" />
            <Product className="hero-product" />
            <div className="object-tag">
              <span>01 — PLACA DE BALCÃO</span>
              <span>PRETO / NFC + QR</span>
            </div>
            <span className="hero-side-label">UM OBJETO. NOVAS CONVERSAS.</span>
          </div>
          <div className="hero-foot">
            <span>COLEÇÃO CONEXÃO — CONCEITO 01</span>
            <span>REPRESENTAÇÃO VETORIAL · PROJETO DEMONSTRATIVO</span>
          </div>
        </section>
        <div className="intro-line">
          <span>Feita para estar perto.</span>
          <p>
            No balcão. No encontro. No momento em que
            <br />
            uma boa experiência ainda está acontecendo.
          </p>
          <span className="outline-arrow" aria-hidden="true">
            ↘
          </span>
        </div>
        <Experience key={`exp-${resetKey}`} reduced={reduceMotion} />
        <section className="benefits section">
          <span className="eyebrow">O QUE A PLACA ACRESCENTA</span>
          <div className="benefit-heading">
            <h2>
              Presença física.
              <br />
              <em>Conexão possível.</em>
            </h2>
            <p>
              Um convite bem colocado pode fazer parte do atendimento com
              naturalidade.
            </p>
          </div>
          <div className="benefit-grid">
            <article>
              <span>01</span>
              <h3>
                O convite,
                <br />à vista.
              </h3>
              <p>
                Uma presença no balcão para lembrar o cliente de compartilhar a
                experiência.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>
                Um caminho
                <br />
                até o link.
              </h3>
              <p>
                Acesso por NFC ou QR, sem procurar manualmente o
                estabelecimento. <Refs ids={["G01", "T01", "T02"]} />
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>
                Parte
                <br />
                do seu espaço.
              </h3>
              <p>
                Uma peça compacta, com linguagem visual que conversa com o
                ambiente.
              </p>
            </article>
          </div>
          <p className="fine">
            Conceito de design. Reduzir etapas é uma proposta de usabilidade,
            sem percentual de efeito medido para estas placas.
          </p>
        </section>
        <section id="objeto" className="product-section section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / O OBJETO EM DETALHE</span>
              <h2>
                Discreto no espaço.
                <br />
                <em>Presente na experiência.</em>
              </h2>
            </div>
            <p>
              Proporção, textura e um ponto de conexão.
              <br />
              Explore o conceito por outro ângulo.
            </p>
          </div>
          <div className="product-detail-grid">
            <div
              className={`detail-stage ${finish === "Branco" ? "light-finish" : ""}`}
            >
              <Product finish={finish} view={view} />
              <span className="stage-note">
                CONCEITO VETORIAL · {finish.toUpperCase()}
              </span>
              <div className="view-controls" aria-label="Vista do produto">
                {[
                  ["front", "Frente"],
                  ["base", "Base"],
                  ["detail", "Acabamento"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    aria-pressed={view === id}
                    onClick={() => setView(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="product-info">
              <span className="eyebrow">PLACA DE BALCÃO / CONCEITO 01</span>
              <h3>
                O essencial.
                <br />
                Com intenção.
              </h3>
              <p>
                Superfície de acrílico, borda polida com espessura aparente e
                uma base de apoio. Um estudo de objeto, luz e presença.
              </p>
              <FinishPicker value={finish} onChange={setFinish} />
              <dl className="specs">
                <div>
                  <dt>Dimensões conceituais</dt>
                  <dd>11 × 15 cm</dd>
                </div>
                <div>
                  <dt>Material proposto</dt>
                  <dd>Acrílico com bordas polidas (conceito)</dd>
                </div>
                <div>
                  <dt>Conexão conceitual</dt>
                  <dd>NFC com URL NDEF + QR Code</dd>
                </div>
                <div>
                  <dt>Uso pensado</dt>
                  <dd>Balcões e pontos de atendimento</dd>
                </div>
              </dl>
              <p className="fine">
                Medidas, material e especificações ilustrativos. Este conceito
                não corresponde a um produto fabricado ou certificado.
              </p>
            </div>
          </div>
        </section>
        <section className="personalization section" id="personalizar">
          <div className="personal-copy">
            <span className="eyebrow">03 / COM A SUA IDENTIDADE</span>
            <h2>
              Seu nome.
              <br />
              <em>Seu jeito de convidar.</em>
            </h2>
            <p>
              Faça o objeto conversar com o seu espaço.
              <br />A prévia acompanha cada palavra.
            </p>
            <label htmlFor="business">
              Nome do estabelecimento <span>{name.length}/28</span>
            </label>
            <input
              id="business"
              maxLength={28}
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 28))}
              placeholder="Seu estabelecimento"
            />
            <label htmlFor="message">
              Mensagem do convite <span>{message.length}/64</span>
            </label>
            <textarea
              id="message"
              rows={2}
              maxLength={64}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 64))}
              placeholder={initialPersonalization.message}
            />
            <details className="suggestion-options">
              <summary>Inspirações para o convite</summary>
              <div className="suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setMessage(s)}
                    aria-label={`Usar sugestão: ${s}`}
                  >
                    {String(i + 1).padStart(2, "0")} <span>{s}</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </details>
            <p className="fine">
              Um convite para opiniões honestas, sem pedir uma nota específica.{" "}
              <Refs ids={["G04"]} />
            </p>
          </div>
          <div className="personal-preview">
            <Product finish={finish} name={name} message={message} />
            <span className="eyebrow">
              PRÉVIA AO VIVO · {finish.toUpperCase()}
            </span>
            <FinishPicker value={finish} onChange={setFinish} />
          </div>
        </section>
        <Suspense
          fallback={
            <section className="section">Carregando simuladores…</section>
          }
        >
          <Simulators key={resetKey} />
        </Suspense>
        <section id="colecao" className="shop section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">05 / ESCOLHA SUA CONFIGURAÇÃO</span>
              <h2>
                Um novo ponto
                <br />
                <em>de conexão.</em>
              </h2>
            </div>
            <p>
              Explore a compra do início ao fim.
              <br />
              Toda esta experiência é demonstrativa.
            </p>
          </div>
          <div className="shop-grid">
            <div
              className={`shop-stage ${model === "kit3" ? "kit-stage" : ""}`}
            >
              <Product finish={finish} name={name} message={message} />
              {model === "kit3" && (
                <>
                  <Product finish={finish} name={name} message={message} />
                  <Product finish={finish} name={name} message={message} />
                </>
              )}
              <span className="stage-note">
                {model === "kit3"
                  ? "03 PLACAS / UM KIT"
                  : "01 PLACA / UMA CONEXÃO"}
              </span>
            </div>
            <div className="shop-config">
              <fieldset className="model-options">
                <legend>Formato</legend>
                {products.map((p) => (
                  <label
                    className={model === p.id ? "selected" : ""}
                    key={p.id}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={p.id}
                      checked={model === p.id}
                      onChange={() => setModel(p.id)}
                    />
                    <span>
                      <b>{p.name}</b>
                      <small>
                        {p.plates === 3
                          ? "Três pontos para o mesmo convite"
                          : "Um convite no seu balcão"}
                      </small>
                    </span>
                    <strong>{money(p.price)}</strong>
                  </label>
                ))}
              </fieldset>
              <p className="fine price-notice">
                Valores ilustrativos desta demonstração
              </p>
              <FinishPicker value={finish} onChange={setFinish} />
              <div className="quantity-row">
                <label htmlFor="quantity">
                  Quantidade de {model === "kit3" ? "kits" : "placas"}
                </label>
                <div className="stepper">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => q - 1)}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={quantity >= 20}
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="fine">
                {quantity} {model === "kit3" ? "kit(s)" : "unidade(s)"} ={" "}
                {quantity * selected.plates} placa(s). Acabamento sem diferença
                de preço.
              </p>
              <div className="config-personal">
                <span>PERSONALIZAÇÃO</span>
                <b>{name.trim() || initialPersonalization.name}</b>
                <small>
                  {message.trim() || initialPersonalization.message}
                </small>
                <a href="#personalizar">Editar personalização ↗</a>
              </div>
              <div className="shop-price">
                <span>Subtotal da seleção</span>
                <strong>{money(selected.price * quantity)}</strong>
              </div>
              <button
                className="button full"
                onClick={() => {
                  try {
                    setCart(
                      addItem(cart, {
                        id: crypto.randomUUID(),
                        model,
                        finish,
                        quantity,
                        name: name.trim() || initialPersonalization.name,
                        message:
                          message.trim() || initialPersonalization.message,
                      }),
                    );
                    notify("Configuração adicionada ao carrinho.");
                    setModal("cart");
                  } catch (error) {
                    notify((error as Error).message);
                  }
                }}
              >
                Adicionar à sacola <span>↗</span>
              </button>
              <p className="fine">
                Frete demonstrativo fixo de R$ 19,90 por carrinho.
                <br />
                Nenhum pagamento será realizado.
              </p>
              <button className="text-button" onClick={() => setModal("cart")}>
                Ver sacola ({totals.items}) ↗
              </button>
            </div>
          </div>
        </section>
        <section className="faq section">
          <div>
            <span className="eyebrow">06 / ANTES DE APROXIMAR</span>
            <h2>
              Boas perguntas.
              <br />
              <em>Respostas claras.</em>
            </h2>
            <p>
              Transparência também faz
              <br />
              parte da experiência.
            </p>
          </div>
          <div className="faq-list">
            {faq.map(([q, a, ids]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>
                  {a} {ids && <Refs ids={ids.split(",")} />}
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="sources section" id="fontes">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FONTES & MÉTODO</span>
              <h2>
                Design com intenção.
                <br />
                <em>Informação com origem.</em>
              </h2>
            </div>
            <p>
              O que é documentado, o que é conceito
              <br />e o que é uma hipótese sua.
            </p>
          </div>
          <div className="evidence-types">
            <div>
              <span>01 / FONTES</span>
              <p>
                Orientações oficiais sobre acesso, avaliações e busca local.
                Identificadas por códigos junto ao conteúdo.
              </p>
            </div>
            <div>
              <span>02 / CONCEITO</span>
              <p>
                Produto vetorial, medidas, material, preços e frete fictícios.
                Não são oferta comercial.
              </p>
            </div>
            <div>
              <span>03 / HIPÓTESES</span>
              <p>
                Valores editáveis nos simuladores. Não são resultados
                observados, benchmarks ou garantias.
              </p>
            </div>
          </div>
          <details className="sources-details">
            <summary>
              Consultar referências e limites <span>↗</span>
            </summary>
            <p className="fine">
              Consulta do material-base: 17/10/2026. Google G01–G04 e B01,
              Android T02 e pesquisa R01 conferidos nesta implementação. A
              página T01 depende de JavaScript; seu resumo foi preservado do
              kit, sem nova validação integral.
            </p>
            {sources
              .filter((s) => s.id !== "R01")
              .map((s) => (
                <article
                  className="source-item"
                  id={`fonte-${s.id}`}
                  key={s.id}
                >
                  <span>{s.id}</span>
                  <div>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.titulo} ↗
                    </a>
                    <p>{s.resumo}</p>
                    <p className="fine">
                      Limite: {s.limite} Consulta do kit: {s.consultado_em}.
                    </p>
                  </div>
                </article>
              ))}
            <article id="fonte-R01" className="source-item">
              <span>R01</span>
              <div>
                <a
                  href={sources.find((s) => s.id === "R01")!.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pesquisa em contexto: Michael Luca / Yelp ↗
                </a>
                <p>
                  Working paper 12-016 (2011, revisão 2016), com restaurantes de
                  Seattle e dados de 2003–2009. Explora efeitos de notas no Yelp
                  sobre receita, especialmente em restaurantes independentes.
                </p>
                <p className="fine">
                  Contexto do kit, consultado em 17/10/2026. Não trata de Google
                  Reviews, placas NFC, Brasil ou lucro. Nenhum resultado desse
                  estudo é usado como multiplicador nos simuladores.
                </p>
              </div>
            </article>
          </details>
          <details className="sources-details">
            <summary>
              Fórmulas e proveniência <span>↗</span>
            </summary>
            <p>
              Avaliações: A × D × (C/100) × (P/100) × meses. Financeiro: receita
              = V × T; contribuição = receita × (g/100); saldo mensal =
              contribuição − custos; saldo acumulado = saldo mensal × meses −
              investimento. Recuperação = investimento ÷ saldo mensal apenas se
              este for positivo.
            </p>
            <p>
              As representações de produto refinam os SVGs originais CC0-1.0 do
              kit. A captura de referência não foi publicada. A composição, os
              ícones e a interface são próprios deste projeto. Tipografia:
              fontes do sistema, sem downloads de fontes. QR gerado com qrcode,
              licença MIT.
            </p>
            <p>
              {claims.local.text} <Refs ids={["G03"]} />
            </p>
          </details>
        </section>
        <section className="agency section">
          <span className="eyebrow">UMA EXPERIÊNCIA MONTES DEVELOPERS</span>
          <div>
            <h2>
              Seu produto tem uma história.
              <br />
              <em>Vamos dar forma a ela.</em>
            </h2>
            <button
              className="agency-link"
              onClick={() => setModal("briefing")}
            >
              Preparar meu briefing <span>↗</span>
            </button>
          </div>
          <p>
            Estratégia, design e desenvolvimento
            <br />
            para experiências que fazem sentido.
          </p>
          <span className="agency-wordmark">
            montes<span>developers</span>
          </span>
        </section>
      </main>
      <footer className="site-footer">
        <p>Projeto demonstrativo de e-commerce criado pela Montes Developers</p>
        <span>CONCEITO INDEPENDENTE · 2026</span>
        <p>
          Google é uma referência informativa. Sem afiliação, parceria ou
          certificação.
        </p>
        <a href="#inicio">Voltar ao início ↑</a>
        {appBase.endsWith("/sistemas/placas/") && <a href={`${appBase}../../`}>Voltar ao portfólio Montes ↗</a>}
        <button
          className="motion-toggle"
          aria-pressed={reduceMotion}
          onClick={() => setReduceMotion(!reduceMotion)}
        >
          {reduceMotion ? "Movimento reduzido ativado" : "Reduzir movimento"}
        </button>
      </footer>
      {storageWarning && (
        <p className="storage-warning" role="status">
          O navegador bloqueou o armazenamento local. O carrinho ficará
          disponível apenas nesta sessão.
        </p>
      )}
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
      {modal === "cart" && (
        <Cart
          items={cart}
          setItems={setCart}
          onClose={() => setModal(null)}
          onReset={reset}
          notify={notify}
          notice={toast}
        />
      )}
      {modal === "briefing" && (
        <Briefing
          onClose={() => setModal(null)}
          notify={notify}
          notice={toast}
        />
      )}
    </>
  );
}
function FinishPicker({
  value,
  onChange,
}: {
  value: Finish;
  onChange: (f: Finish) => void;
}) {
  return (
    <fieldset className="finish-picker">
      <legend>
        Acabamento <span>— {value}</span>
      </legend>
      {(["Preto", "Branco"] as const).map((f) => (
        <button
          key={f}
          className={value === f ? "selected" : ""}
          aria-pressed={value === f}
          onClick={() => onChange(f)}
        >
          <span className={`swatch ${f.toLowerCase()}`} />
          {f}
        </button>
      ))}
    </fieldset>
  );
}
