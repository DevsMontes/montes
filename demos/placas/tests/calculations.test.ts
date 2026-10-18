import { test } from "node:test";
import assert from "node:assert/strict";
import { reviewCalculation, financeCalculation, validNumber } from "../src/lib";
test("Contrato: 440 convidados, 22 por mês e 66 acumuladas, começando em zero", () => {
  const r = reviewCalculation({ A: 40, D: 22, C: 50, P: 5, M: 3 });
  assert.equal(r.invited, 440);
  assert.equal(r.monthly, 22);
  assert.deepEqual(
    r.series.map((p) => p.value),
    [0, 22, 44, 66],
  );
  assert.equal(r.total, 66);
});
test("Taxa zero, atendimento zero e nenhum convidado produzem zero", () => {
  for (const patch of [{ P: 0 }, { A: 0 }, { C: 0 }]) {
    const r = reviewCalculation({ A: 40, D: 22, C: 50, P: 5, M: 12, ...patch });
    assert.equal(r.total, 0);
    assert.ok(r.series.every((p) => p.value === 0));
  }
});
test("Preserva intermediários fracionários e aceita horizonte de 12 meses", () => {
  const r = reviewCalculation({ A: 13, D: 17, C: 23.3, P: 7.2, M: 12 });
  assert.ok(Math.abs(r.total - 44.489952) < 0.000001);
  assert.equal(r.series.length, 13);
});
test("Financeiro inicial: saldo -149 e sem recuperação", () => {
  const r = financeCalculation({ V: 0, T: 100, g: 30, O: 0, K: 149, M: 3 });
  assert.equal(r.total, -149);
  assert.equal(r.payback, null);
  assert.deepEqual(
    r.series.map((p) => p.value),
    [-149, -149, -149, -149],
  );
});
test("Exemplo de verificação financeiro do kit", () => {
  const r = financeCalculation({ V: 10, T: 100, g: 30, O: 20, K: 149, M: 1 });
  assert.equal(r.revenue, 1000);
  assert.equal(r.contribution, 300);
  assert.equal(r.monthly, 280);
  assert.equal(r.total, 131);
  assert.ok(Math.abs(r.payback! - 149 / 280) < 1e-10);
});
test("Saldo negativo é visível; não divide por zero", () => {
  const r = financeCalculation({ V: 0, T: 100, g: 30, O: 20, K: 149, M: 3 });
  assert.equal(r.total, -209);
  assert.equal(r.payback, null);
  assert.equal(
    financeCalculation({ V: 1, T: 0, g: 0, O: 0, K: 0, M: 1 }).payback,
    null,
  );
});
test("Investimento zero com saldo positivo tem recuperação imediata", () => {
  assert.equal(
    financeCalculation({ V: 1, T: 100, g: 30, O: 0, K: 0, M: 1 }).payback,
    0,
  );
});
test("Validação recusa vazios, NaN, infinito, negativos, limites e meses fracionários", () => {
  for (const raw of ["", " ", "abc", "NaN", "Infinity", "-1", "101"])
    assert.equal(validNumber(raw, 0, 100), false);
  assert.equal(validNumber("2.5", 1, 12, true), false);
  assert.equal(validNumber("0", 0, 100), true);
  assert.equal(validNumber("100", 0, 100), true);
  assert.equal(validNumber("0.5", 0, 100), true);
  assert.equal(validNumber("31", 1, 31, true), true);
  assert.equal(validNumber("0", 1, 31, true), false);
});
