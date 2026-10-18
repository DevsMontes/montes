import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem,
  cartTotals,
  readCart,
  orderSummary,
  type CartItem,
} from "../src/lib";
const single: CartItem = {
  id: "one",
  model: "mesa",
  quantity: 1,
  finish: "Preto",
  name: "Café exemplo",
  message: "Conte como foi.",
};
test("Uma placa: R$149 + frete R$19,90 = R$168,90", () =>
  assert.deepEqual(cartTotals([single]), {
    subtotal: 14900,
    shipping: 1990,
    total: 16890,
    items: 1,
    plates: 1,
  }));
test("Dois kits são seis placas: R$798 + um frete", () =>
  assert.deepEqual(cartTotals([{ ...single, model: "kit3", quantity: 2 }]), {
    subtotal: 79800,
    shipping: 1990,
    total: 81790,
    items: 2,
    plates: 6,
  }));
test("Carrinho misto e acabamento não alteram preços; frete único", () =>
  assert.equal(
    cartTotals([
      single,
      { ...single, id: "two", model: "kit3", finish: "Branco", quantity: 2 },
    ]).total,
    96690,
  ));
test("Carrinho vazio não cobra frete", () =>
  assert.deepEqual(cartTotals([]), {
    subtotal: 0,
    shipping: 0,
    total: 0,
    plates: 0,
    items: 0,
  }));
test("Configuração idêntica soma; personalização diferente mantém linha", () => {
  const cart = addItem([single], { ...single, id: "new", quantity: 2 });
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 3);
  assert.equal(
    addItem(cart, { ...single, id: "different", message: "Outro convite" })
      .length,
    2,
  );
});
test("Limite de 20 itens não descarta quantidade silenciosamente", () =>
  assert.throws(
    () => addItem([{ ...single, quantity: 20 }], single),
    /Limite/,
  ));
test("Persistência retém valores; conteúdo corrompido e adulterado é recusado", () => {
  assert.deepEqual(readCart(JSON.stringify([single])), [single]);
  for (const raw of ["invalid", "{}", "null"])
    assert.deepEqual(readCart(raw), []);
  assert.deepEqual(
    readCart(
      JSON.stringify([
        { ...single, model: "unknown" },
        { ...single, quantity: 0 },
        { ...single, quantity: 21 },
        { ...single, quantity: 1.5 },
        { ...single, name: "x".repeat(29) },
        { ...single, finish: "Invalid" },
        null,
      ]),
    ),
    [],
  );
});
test("Resumo distingue simulação de pedido e conserva configuração", () => {
  const result = orderSummary([{ ...single, model: "kit3", quantity: 2 }]);
  assert.match(result, /6 placa/);
  assert.match(result, /817,90/);
  assert.match(result, /Nenhum pagamento/);
  assert.match(result, /Café exemplo/);
  assert.match(result, /SIMULAÇÃO CONCLUÍDA/);
});

test("Acabamentos antigos migram sem perder a configuração salva", () => {
  const restored = readCart(
    JSON.stringify([
      { ...single, finish: "Grafite" },
      { ...single, id: "two", finish: "Marfim" },
    ]),
  );
  assert.deepEqual(
    restored.map((i) => i.finish),
    ["Preto", "Branco"],
  );
  assert.equal(restored[0].name, single.name);
  assert.equal(cartTotals(restored).total, 31790);
});
