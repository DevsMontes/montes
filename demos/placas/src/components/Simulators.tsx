import { useState } from "react";
import {
  financeCalculation,
  financeDefaults,
  reviewCalculation,
  reviewDefaults,
  validNumber,
  money,
  number,
} from "../lib";
import { disclaimer } from "../data/content";
import Chart from "./Chart";
type Field = {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  integer?: boolean;
};
const reviewFields: Field[] = [
  {
    key: "A",
    label: "Atendimentos por dia",
    min: 0,
    max: 100000,
    integer: true,
  },
  {
    key: "D",
    label: "Dias de funcionamento / mês",
    min: 1,
    max: 31,
    integer: true,
  },
  { key: "C", label: "Clientes convidados", min: 0, max: 100, unit: "%" },
  {
    key: "P",
    label: "Publicação entre convidados",
    min: 0,
    max: 100,
    unit: "%",
  },
  {
    key: "M",
    label: "Horizonte",
    min: 1,
    max: 12,
    unit: "meses",
    integer: true,
  },
];
const financeFields: Field[] = [
  {
    key: "V",
    label: "Vendas adicionais / mês",
    min: 0,
    max: 100000,
    integer: true,
  },
  { key: "T", label: "Ticket médio", min: 0, max: 10000000, unit: "R$" },
  { key: "g", label: "Margem de contribuição", min: 0, max: 100, unit: "%" },
  {
    key: "O",
    label: "Custos adicionais / mês",
    min: 0,
    max: 10000000,
    unit: "R$",
  },
  {
    key: "K",
    label: "Investimento inicial",
    min: 0,
    max: 10000000,
    unit: "R$",
  },
  {
    key: "M",
    label: "Horizonte independente",
    min: 1,
    max: 12,
    unit: "meses",
    integer: true,
  },
];
function Fields({
  fields,
  values,
  onChange,
  prefix,
}: {
  fields: Field[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  prefix: string;
}) {
  return (
    <div className="sim-fields">
      {fields.map((f) => {
        const valid = validNumber(values[f.key], f.min, f.max, f.integer);
        const id = `${prefix}-${f.key}`;
        return (
          <div className="sim-field" key={f.key}>
            <label htmlFor={id}>
              {f.label}
              {f.unit && <span>{f.unit}</span>}
            </label>
            <input
              id={id}
              type="number"
              inputMode={f.integer ? "numeric" : "decimal"}
              min={f.min}
              max={f.max}
              step={f.integer ? 1 : "any"}
              value={values[f.key]}
              onChange={(e) => onChange(f.key, e.target.value)}
              aria-invalid={!valid}
              aria-describedby={!valid ? `${id}-error` : undefined}
            />
            {!valid && (
              <p className="error" id={`${id}-error`}>
                Informe {f.integer ? "um inteiro" : "um número"} entre{" "}
                {number(f.min)} e {number(f.max)}.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
const parse = (v: Record<string, string>) =>
  Object.fromEntries(Object.entries(v).map(([k, v]) => [k, Number(v)]));
function Finance() {
  const [values, setValues] = useState({ ...financeDefaults });
  const valid = financeFields.every((f) =>
    validNumber(values[f.key as keyof typeof values], f.min, f.max, f.integer),
  );
  const v = parse(values) as unknown as Parameters<
    typeof financeCalculation
  >[0];
  const result = valid ? financeCalculation(v) : null;
  const premises = `Hipóteses: ${values.V} vendas/mês; ticket R$ ${values.T}; margem ${values.g}%; custos R$ ${values.O}/mês; investimento R$ ${values.K}.`;
  return (
    <div className="finance-module">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CENÁRIO INDEPENDENTE / OPCIONAL</span>
          <h3>
            Outras hipóteses.
            <br />
            Outra conta.
          </h3>
        </div>
        <p>
          Informe uma hipótese própria de vendas adicionais. Avaliações não são
          convertidas em vendas neste cálculo.
        </p>
      </div>
      <p className="notice">{disclaimer}</p>
      <div className="sim-layout">
        <div>
          <Fields
            prefix="financial"
            fields={financeFields}
            values={values}
            onChange={(k, v) => setValues({ ...values, [k]: v })}
          />
          <button
            className="text-button"
            onClick={() => setValues({ ...financeDefaults })}
          >
            Restaurar cenário financeiro ↺
          </button>
        </div>
        <div>
          {result ? (
            <>
              <div className="financial-results">
                <div>
                  <span>Receita incremental / mês</span>
                  <strong>{money(result.revenue * 100)}</strong>
                </div>
                <div>
                  <span>Contribuição / mês</span>
                  <strong>{money(result.contribution * 100)}</strong>
                </div>
                <div>
                  <span>Saldo incremental / mês</span>
                  <strong>{money(result.monthly * 100)}</strong>
                </div>
                <div>
                  <span>Recuperação do investimento</span>
                  <strong className="small-result">
                    {result.payback === null
                      ? "Sem recuperação neste cenário"
                      : result.payback === 0
                        ? "Imediata"
                        : `${number(result.payback, 2)} mês(es)`}
                  </strong>
                </div>
              </div>
              <Chart financial series={result.series} premises={premises} />
            </>
          ) : (
            <p className="notice">
              Corrija os campos indicados para calcular o cenário.
            </p>
          )}
          <p className="fine">
            O saldo incremental simulado após investimento depende das premissas
            inseridas e não equivale a lucro líquido. Tributos e custos não
            incluídos na margem precisam ser considerados por você.
          </p>
        </div>
      </div>
    </div>
  );
}
export default function Simulators() {
  const [values, setValues] = useState({ ...reviewDefaults });
  const [finance, setFinance] = useState(false);
  const valid = reviewFields.every((f) =>
    validNumber(values[f.key as keyof typeof values], f.min, f.max, f.integer),
  );
  const v = parse(values) as unknown as Parameters<typeof reviewCalculation>[0];
  const result = valid ? reviewCalculation(v) : null;
  const premises = `Hipóteses: ${values.A} atendimentos/dia × ${values.D} dias/mês × ${values.C}% convidados × ${values.P}% de publicação.`;
  return (
    <section id="possibilidades" className="sim-section section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">04 / EXPLORE AS POSSIBILIDADES</span>
          <h2>
            Premissas claras.
            <br />
            <em>Perspectivas suas.</em>
          </h2>
        </div>
        <p>
          O que muda quando o convite faz parte da rotina? Explore um cenário,
          sem confundir uma hipótese com um resultado.
        </p>
      </div>
      <p className="notice">{disclaimer}</p>
      <div className="sim-layout">
        <div>
          <Fields
            fields={reviewFields}
            prefix="review"
            values={values}
            onChange={(k, v) => setValues({ ...values, [k]: v })}
          />
          <p className="fine">
            A taxa de publicação inclui todo o caminho até a decisão do cliente.
            Aproximações e leituras de QR não contam como avaliações.
          </p>
          <button
            className="text-button"
            onClick={() => setValues({ ...reviewDefaults })}
          >
            Restaurar valores iniciais ↺
          </button>
        </div>
        <div className="review-results">
          {result ? (
            <>
              <div className="result-header">
                <strong>≈ {number(result.total, 0)}</strong>
                <div>
                  avaliações estimadas
                  <br />
                  em {values.M} {values.M === "1" ? "mês" : "meses"}
                </div>
                <span>
                  {number(result.invited)} convidados/mês
                  <br />≈ {number(result.monthly)} avaliações/mês
                </span>
              </div>
              <Chart series={result.series} premises={premises} />
            </>
          ) : (
            <p className="notice">
              Corrija os campos indicados. O gráfico reaparece com valores
              válidos.
            </p>
          )}
        </div>
      </div>
      <details className="method">
        <summary>Como esta simulação é calculada</summary>
        <p>
          Convidados/mês = atendimentos × dias × proporção convidada.
          Avaliações/mês = convidados × taxa hipotética de publicação. Acumulado
          = avaliações/mês × mês. Taxas são divididas por 100. Não há
          arredondamento intermediário, probabilidade estatística ou comparação
          com uma curva “sem placa”. Os valores iniciais são escolhas
          ilustrativas: 440 convidados e 22 avaliações por mês; 66 em três
          meses.
        </p>
      </details>
      <button
        className="finance-toggle"
        onClick={() => setFinance(!finance)}
        aria-expanded={finance}
        aria-controls="finance-panel"
      >
        <span>
          <b>Cenário financeiro independente</b>
          <small>Opcional · com suas próprias hipóteses de vendas</small>
        </span>
        <span aria-hidden="true">{finance ? "−" : "+"}</span>
      </button>
      <div id="finance-panel">{finance && <Finance />}</div>
    </section>
  );
}
