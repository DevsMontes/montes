import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  cartTotals,
  downloadText,
  money,
  orderSummary,
  products,
  type CartItem,
  type Finish,
} from "../lib";
import { Product } from "./Product";
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
  notice = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  notice?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "dialog wide" : "dialog"}
      aria-labelledby="dialog-title"
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const elements = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.getClientRects().length > 0);
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !e.currentTarget.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-header">
        <span className="eyebrow">MONTES / DEMONSTRAÇÃO</span>
        <button
          autoFocus
          className="close-button"
          aria-label="Fechar janela"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <h2 id="dialog-title">{title}</h2>
      <div role="status" aria-live="polite" className="dialog-feedback">
        {notice}
      </div>
      {children}
    </dialog>
  );
}
export function Cart({
  items,
  setItems,
  onClose,
  onReset,
  notify,
  notice,
}: {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  onClose: () => void;
  onReset: () => void;
  notify: (msg: string) => void;
  notice?: string;
}) {
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [completed, setCompleted] = useState<CartItem[]>([]);
  const [agreed, setAgreed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const totals = cartTotals(stage === "done" ? completed : items);
  useEffect(() => {
    heading.current?.focus();
  }, [stage]);
  const update = (id: string, patch: Partial<CartItem>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const summary = orderSummary(completed);
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      notify("Resumo copiado.");
    } catch {
      notify("Cópia indisponível. Use Baixar resumo.");
    }
  }
  return (
    <Dialog
      title={
        stage === "cart"
          ? "Sua seleção."
          : stage === "checkout"
            ? "Tudo pronto para simular."
            : "Simulação concluída"
      }
      onClose={onClose}
      notice={notice}
      wide
    >
      <h3 className="sr-only" ref={heading} tabIndex={-1}>
        {stage === "cart"
          ? "Carrinho"
          : stage === "checkout"
            ? "Revisão da simulação"
            : "Confirmação da simulação"}
      </h3>
      {stage === "done" ? (
        <>
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <p>
            Nenhum pagamento foi realizado e nenhum pedido comercial foi
            recebido. Esta foi uma experiência demonstrativa.
          </p>
          <div className="receipt">
            {completed.map((i) => (
              <div key={i.id}>
                <b>
                  {i.quantity} × {products.find((p) => p.id === i.model)!.name}{" "}
                  · {i.finish}
                </b>
                <span>
                  {i.name} — {i.message}
                </span>
                <small>
                  {i.quantity * products.find((p) => p.id === i.model)!.plates}{" "}
                  placa(s) ·{" "}
                  {money(
                    i.quantity * products.find((p) => p.id === i.model)!.price,
                  )}
                </small>
              </div>
            ))}
          </div>
          <Totals totals={totals} />
          <div className="button-row">
            <button
              className="button"
              onClick={() => downloadText("montes-simulacao.txt", summary)}
            >
              Baixar resumo ↓
            </button>
            <button className="button secondary" onClick={copy}>
              Copiar resumo
            </button>
          </div>
          <button
            className="text-button"
            onClick={() => {
              onReset();
              onClose();
              notify("Experiência reiniciada.");
            }}
          >
            Reiniciar a experiência ↺
          </button>
        </>
      ) : items.length === 0 ? (
        <div className="empty-cart">
          <span>Um espaço para sua escolha.</span>
          <p>
            Seu carrinho está vazio. Explore os acabamentos e configure sua
            placa.
          </p>
          <button
            className="button"
            onClick={() => {
              onClose();
              document.getElementById("colecao")?.scrollIntoView();
            }}
          >
            Conhecer a coleção ↗
          </button>
        </div>
      ) : (
        <>
          <p className="notice">
            Valores ilustrativos desta demonstração. Nenhum pagamento será
            realizado.
          </p>
          {stage === "cart" ? (
            <div className="cart-items">
              {items.map((i, index) => {
                const product = products.find((p) => p.id === i.model)!;
                return (
                  <article className="cart-item" key={i.id}>
                    <div className="cart-thumb">
                      <Product
                        finish={i.finish}
                        name={i.name}
                        message={i.message}
                      />
                    </div>
                    <div className="cart-item-content">
                      <div className="cart-item-title">
                        <h3>{product.name}</h3>
                        <strong>{money(product.price * i.quantity)}</strong>
                      </div>
                      <p>
                        {product.plates === 3
                          ? `${i.quantity} kit(s) = ${i.quantity * 3} placas`
                          : `${i.quantity} placa(s)`}{" "}
                        · {money(product.price)} por{" "}
                        {product.plates === 3 ? "kit" : "placa"}
                      </p>
                      <div className="cart-controls">
                        <label>
                          Acabamento
                          <select
                            aria-label={`Acabamento do item ${index + 1}`}
                            value={i.finish}
                            onChange={(e) =>
                              update(i.id, { finish: e.target.value as Finish })
                            }
                          >
                            <option>Preto</option>
                            <option>Branco</option>
                          </select>
                        </label>
                        <label>
                          Quantidade
                          <select
                            aria-label={`Quantidade do item ${index + 1}`}
                            value={i.quantity}
                            onChange={(e) =>
                              update(i.id, { quantity: Number(e.target.value) })
                            }
                          >
                            {Array.from({ length: 20 }, (_, n) => (
                              <option key={n} value={n + 1}>
                                {n + 1}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <details>
                        <summary>Personalização</summary>
                        <label>
                          Nome do estabelecimento
                          <input
                            maxLength={28}
                            value={i.name}
                            onChange={(e) =>
                              update(i.id, {
                                name: e.target.value.slice(0, 28),
                              })
                            }
                          />
                        </label>
                        <label>
                          Mensagem
                          <input
                            maxLength={64}
                            value={i.message}
                            onChange={(e) =>
                              update(i.id, {
                                message: e.target.value.slice(0, 64),
                              })
                            }
                          />
                        </label>
                      </details>
                      <button
                        className="text-button remove"
                        aria-label={`Remover ${product.name}, item ${index + 1}`}
                        onClick={() => {
                          setItems(items.filter((x) => x.id !== i.id));
                          notify("Item removido do carrinho.");
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="checkout-review">
              <span className="eyebrow">REVISÃO DA CONFIGURAÇÃO</span>
              {items.map((i) => (
                <p key={i.id}>
                  <b>
                    {i.quantity} ×{" "}
                    {products.find((p) => p.id === i.model)!.name} · {i.finish}
                  </b>
                  <br />
                  {i.name}
                  <br />
                  <span>{i.message}</span>
                </p>
              ))}
              <div className="example-data">
                <b>Entrega de exemplo</b>
                <p>
                  Destinatário: Cliente demonstração
                  <br />
                  Destino: endereço fictício, sem coleta de dados.
                </p>
                <p>
                  Frete fixo demonstrativo. Prazo ilustrativo: 5 a 8 dias úteis;
                  não calculado por transportadora.
                </p>
              </div>
            </div>
          )}
          <Totals totals={totals} />
          <p className="fine">
            {totals.plates} placa(s) no total. Cada kit contém 3 placas. Frete
            fixo por carrinho.
          </p>
          {stage === "cart" ? (
            <button
              className="button full"
              onClick={() => setStage("checkout")}
            >
              Revisar compra demonstrativa <span>↗</span>
            </button>
          ) : (
            <>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  Entendo que é uma demonstração. Nenhum pagamento será
                  realizado.
                </span>
              </label>
              <button
                className="button full"
                disabled={!agreed}
                onClick={() => {
                  setCompleted(items.map((i) => ({ ...i })));
                  setItems([]);
                  setStage("done");
                  notify("Simulação concluída.");
                }}
              >
                Concluir simulação <span>↗</span>
              </button>
              <button className="text-button" onClick={() => setStage("cart")}>
                ← Voltar ao carrinho
              </button>
            </>
          )}
        </>
      )}
    </Dialog>
  );
}
function Totals({ totals }: { totals: ReturnType<typeof cartTotals> }) {
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{money(totals.subtotal)}</dd>
      </div>
      <div>
        <dt>Frete demonstrativo</dt>
        <dd>{money(totals.shipping)}</dd>
      </div>
      <div className="grand-total">
        <dt>Total ilustrativo</dt>
        <dd>{money(totals.total)}</dd>
      </div>
    </dl>
  );
}
export function Briefing({
  onClose,
  notify,
  notice,
}: {
  onClose: () => void;
  notify: (msg: string) => void;
  notice?: string;
}) {
  const [product, setProduct] = useState("Placas de balcão com NFC e QR Code");
  const [aim, setAim] = useState(
    "Apresentar meu produto e oferecer uma compra clara e intuitiva.",
  );
  const [notes, setNotes] = useState("");
  const text = `BRIEFING LOCAL / MONTES DEVELOPERS\nProduto: ${product}\nObjetivo: ${aim}\nObservações: ${notes}\n\nEste briefing não foi enviado. Projeto demonstrativo de portfólio.`;
  return (
    <Dialog title="Sua próxima conexão." onClose={onClose} notice={notice}>
      <p>
        Prepare um ponto de partida para seu projeto. O briefing fica neste
        navegador e só sai quando você copia ou baixa.
      </p>
      <label>
        O que você vende?
        <input
          maxLength={120}
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
      </label>
      <label>
        O que a experiência deve resolver?
        <textarea
          maxLength={600}
          value={aim}
          onChange={(e) => setAim(e.target.value)}
        />
      </label>
      <label>
        Observações opcionais
        <textarea
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <div className="button-row">
        <button
          className="button"
          onClick={() => downloadText("briefing-montes.txt", text)}
        >
          Baixar briefing ↓
        </button>
        <button
          className="button secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              notify("Briefing copiado.");
            } catch {
              notify("Cópia indisponível. Use Baixar briefing.");
            }
          }}
        >
          Copiar
        </button>
      </div>
      <p className="fine">Nenhum dado é enviado à agência.</p>
    </Dialog>
  );
}
