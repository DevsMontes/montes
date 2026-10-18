import { demoPath } from "../paths";
import { useEffect, useRef, useState } from "react";
import { claims } from "../data/content";
import { Product, QR, NfcIcon } from "./Product";
export function Refs({ ids }: { ids: string[] }) {
  return (
    <span className="refs">
      {ids.map((id) => (
        <a
          key={id}
          href={`#fonte-${id}`}
          onClick={() => {
            const target = document.getElementById(`fonte-${id}`);
            const details = target?.closest("details");
            if (details) details.open = true;
          }}
          aria-label={`Consultar fonte ${id}`}
        >
          {id}
        </a>
      ))}
    </span>
  );
}
const steps = [
  [
    "Um objeto que convida.",
    "Um convite visível no balcão, integrado ao atendimento.",
  ],
  [
    "Uma aproximação.",
    "Aproxime um celular compatível com NFC ou leia o QR pela câmera.",
  ],
  [
    "Um link para abrir.",
    "Se solicitado, confirme a notificação para abrir o link.",
  ],
  [
    "A escolha continua livre.",
    "Abrir o link não publica nada. Avaliar é uma decisão do cliente.",
  ],
];
export default function Experience({ reduced = false }: { reduced?: boolean }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"nfc" | "qr">("nfc");
  const [playing, setPlaying] = useState(false);
  const [manual, setManual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (manual) return;
        entries.forEach((e) => {
          if (e.isIntersecting)
            setStep(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-25% 0px -40% 0px", threshold: 0 },
    );
    section.current
      ?.querySelectorAll("[data-step]")
      .forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, [manual]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function play() {
    if (timer.current) clearTimeout(timer.current);
    setManual(true);
    setPlaying(true);
    setStep(1);
    if (reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(3);
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => {
      setStep(2);
      timer.current = setTimeout(() => {
        setStep(3);
        setPlaying(false);
      }, 1300);
    }, 1000);
  }
  return (
    <section id="experiencia" className="experience section" ref={section}>
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / UM CONVITE, DOIS CAMINHOS</span>
          <h2>
            Do balcão
            <br />
            <em>para a conversa.</em>
          </h2>
        </div>
        <p>
          Um gesto simples para chegar ao convite.
          <br />A opinião continua sendo do cliente.
        </p>
      </div>
      <div className="story-layout">
        <div className="story-visual">
          <div
            className="mode-tabs"
            role="tablist"
            aria-label="Forma de acesso"
          >
            {(["nfc", "qr"] as const).map((m, i) => (
              <button
                key={m}
                role="tab"
                id={`tab-${m}`}
                aria-controls="access-panel"
                aria-selected={mode === m}
                tabIndex={mode === m ? 0 : -1}
                onClick={() => setMode(m)}
                onKeyDown={(e) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? "nfc"
                        : e.key === "End"
                          ? "qr"
                          : mode === "nfc"
                            ? "qr"
                            : "nfc";
                    setMode(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
              >
                <span>0{i + 1}</span>
                {m === "nfc" ? "Por aproximação" : "Pela câmera"}
              </button>
            ))}
          </div>
          <div
            id="access-panel"
            role="tabpanel"
            aria-labelledby={`tab-${mode}`}
            className={`access-scene step-${step} mode-${mode}`}
          >
            <Product />
            <div className="phone">
              <div className="phone-speaker" />
              <span className="phone-time">09:41</span>
              <span className="phone-demo">INTERFACE DEMONSTRATIVA</span>
              <div className="phone-center">
                {mode === "nfc" ? <NfcIcon /> : <QR />}
                <p>
                  {step < 2
                    ? mode === "nfc"
                      ? "Aproxime."
                      : "Leia o QR."
                    : "Um convite para você."}
                </p>
              </div>
              <div className="phone-notification">
                <span className="mini-mark">M</span>
                <div>
                  <b>
                    {step === 3
                      ? "Como foi sua experiência?"
                      : "Link encontrado"}
                  </b>
                  <small>
                    {step === 3
                      ? "Você decide se deseja avaliar."
                      : "Toque para acessar o convite."}
                  </small>
                </div>
              </div>
              <span className="phone-bottom">
                Nenhuma avaliação é publicada aqui.
              </span>
            </div>
            <span className="scene-caption">
              CONCEITO VETORIAL · DEMONSTRAÇÃO
            </span>
          </div>
          <div className="access-explanation">
            <p>
              {mode === "nfc"
                ? claims.compatibility.text
                : "Em aparelhos com leitura de QR pela câmera, enquadre o código e abra o link indicado. É uma alternativa ao NFC."}
            </p>
            <Refs ids={mode === "nfc" ? ["T01", "T02"] : ["G01"]} />
          </div>
          <div className="story-actions">
            <button className="text-button" onClick={play} disabled={playing}>
              {playing
                ? "Demonstração em andamento…"
                : "Reproduzir demonstração"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <a className="text-link" href={demoPath}>
              Abrir convite de exemplo ↗
            </a>
          </div>
        </div>
        <div className="story-steps">
          {steps.map(([title, text], i) => (
            <article
              data-step={i}
              className={step === i ? "active" : ""}
              key={title}
            >
              <span className="step-number">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                {i === 3 && (
                  <p className="fine">
                    Para publicar no Google, é preciso fazer login em uma Conta
                    do Google. <Refs ids={["G02", "G04"]} />
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="honest-note">
        <span>Um convite aberto.</span>
        <p>
          Todas as experiências são bem-vindas. Sem filtro de satisfação, sem
          recompensa, sem pedido de cinco estrelas. <Refs ids={["G04"]} />
        </p>
      </div>
    </section>
  );
}
