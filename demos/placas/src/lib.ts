import catalog from "./data/catalogo.json";
export type Finish = "Preto" | "Branco";
export type Model = "mesa" | "kit3";
export type CartItem = {
  id: string;
  model: Model;
  finish: Finish;
  quantity: number;
  name: string;
  message: string;
};
export const products = catalog.modelos.map((p) => ({
  id: p.id as Model,
  name: p.nome,
  price: Math.round(
    ("preco_unitario" in p ? p.preco_unitario! : p.preco_kit!) * 100,
  ),
  plates: "quantidade_placas" in p ? p.quantidade_placas! : 1,
}));
export const shipping = Math.round(catalog.frete_demo.padrao * 100);
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export const number = (n: number, digits = 1) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(n);
export const reviewDefaults = { A: "40", D: "22", C: "50", P: "5", M: "3" };
export const financeDefaults = {
  V: "0",
  T: "100",
  g: "30",
  O: "0",
  K: "149",
  M: "3",
};
export function validNumber(
  raw: string,
  min: number,
  max = Number.MAX_SAFE_INTEGER,
  integer = false,
) {
  const n = Number(raw);
  return (
    raw.trim() !== "" &&
    Number.isFinite(n) &&
    n >= min &&
    n <= max &&
    (!integer || Number.isInteger(n))
  );
}
export function reviewCalculation(v: {
  A: number;
  D: number;
  C: number;
  P: number;
  M: number;
}) {
  const invited = (v.A * v.D * v.C) / 100;
  const monthly = (invited * v.P) / 100;
  return {
    invited,
    monthly,
    series: Array.from({ length: v.M + 1 }, (_, m) => ({
      month: m,
      value: monthly * m,
    })),
    total: monthly * v.M,
  };
}
export function financeCalculation(v: {
  V: number;
  T: number;
  g: number;
  O: number;
  K: number;
  M: number;
}) {
  const revenue = v.V * v.T,
    contribution = (revenue * v.g) / 100,
    monthly = contribution - v.O;
  return {
    revenue,
    contribution,
    monthly,
    payback: monthly > 0 ? v.K / monthly : null,
    total: monthly * v.M - v.K,
    series: Array.from({ length: v.M + 1 }, (_, m) => ({
      month: m,
      value: monthly * m - v.K,
    })),
  };
}
export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, i) =>
      sum + products.find((p) => p.id === i.model)!.price * i.quantity,
    0,
  );
  return {
    subtotal,
    shipping: items.length ? shipping : 0,
    total: subtotal + (items.length ? shipping : 0),
    plates: items.reduce(
      (n, i) => n + products.find((p) => p.id === i.model)!.plates * i.quantity,
      0,
    ),
    items: items.reduce((n, i) => n + i.quantity, 0),
  };
}
export function addItem(cart: CartItem[], item: CartItem) {
  const match = cart.find(
    (i) =>
      i.model === item.model &&
      i.finish === item.finish &&
      i.name === item.name &&
      i.message === item.message,
  );
  if (match) {
    if (match.quantity + item.quantity > 20)
      throw new Error(
        "Limite de 20 itens por configuração. Ajuste a quantidade no carrinho.",
      );
    return cart.map((i) =>
      i.id === match.id ? { ...i, quantity: i.quantity + item.quantity } : i,
    );
  }
  return [...cart, item];
}
export function readCart(raw: string | null): CartItem[] {
  try {
    const data = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    return data
      .map(
        (i: any) =>
          i && {
            ...i,
            finish:
              i.finish === "Grafite"
                ? "Preto"
                : i.finish === "Marfim"
                  ? "Branco"
                  : i.finish,
          },
      )
      .filter(
        (i: any) =>
          i &&
          typeof i.id === "string" &&
          ["mesa", "kit3"].includes(i.model) &&
          ["Preto", "Branco"].includes(i.finish) &&
          Number.isInteger(i.quantity) &&
          i.quantity >= 1 &&
          i.quantity <= 20 &&
          typeof i.name === "string" &&
          i.name.length <= 28 &&
          typeof i.message === "string" &&
          i.message.length <= 64,
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function orderSummary(items: CartItem[]) {
  const totals = cartTotals(items);
  return [
    "MONTES / SIMULAÇÃO CONCLUÍDA",
    "Nenhum pagamento será realizado. Nenhum pedido comercial foi recebido.",
    "",
    ...items.map(
      (i) =>
        `${i.quantity} × ${products.find((p) => p.id === i.model)!.name} · ${i.finish} · ${products.find((p) => p.id === i.model)!.plates * i.quantity} placa(s)\n${i.name}\n${i.message}\n${money(products.find((p) => p.id === i.model)!.price * i.quantity)}`,
    ),
    "",
    `Subtotal: ${money(totals.subtotal)}`,
    `Frete demonstrativo: ${money(totals.shipping)}`,
    `Total ilustrativo: ${money(totals.total)}`,
    `${totals.plates} placa(s) no total. Valores fictícios.`,
    "Projeto demonstrativo de e-commerce criado pela Montes Developers",
  ].join("\n");
}
