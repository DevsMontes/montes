import { useId, useState } from "react";
import { money, number } from "../lib";
export default function Chart({
  series,
  financial = false,
  premises,
}: {
  series: { month: number; value: number }[];
  financial?: boolean;
  premises: string;
}) {
  const selectId = useId();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((p) => p.value)),
    min = Math.min(0, ...series.map((p) => p.value));
  const x = (m: number) => 100 + (m / (series.length - 1)) * 518,
    y = (v: number) => 238 - ((v - min) / (max - min)) * 200;
  const format = (n: number) => (financial ? money(n * 100) : number(n));
  const selected =
    series[Math.min(active ?? series.length - 1, series.length - 1)];
  return (
    <div className="chart-wrap">
      <div className="chart-label">
        <b>SIMULAÇÃO · </b>
        {financial
          ? "Saldo incremental após investimento (R$)"
          : "Avaliações estimadas acumuladas (avaliações)"}
      </div>
      <svg
        viewBox="0 0 660 280"
        className="chart"
        aria-label={
          financial
            ? "Gráfico do saldo financeiro simulado"
            : "Gráfico de avaliações acumuladas simuladas"
        }
      >
        {[0, 0.5, 1].map((f) => {
          const value = min + (max - min) * f;
          return (
            <g key={f}>
              <line
                x1="100"
                x2="618"
                y1={y(value)}
                y2={y(value)}
                stroke="currentColor"
                opacity=".15"
              />
              <text x="90" y={y(value) + 5} textAnchor="end">
                {new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)}
              </text>
            </g>
          );
        })}
        <path
          d={series
            .map((p, i) => `${i ? "L" : "M"}${x(p.month)},${y(p.value)}`)
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="7 7"
        />
        {series.map((p) => (
          <g key={p.month}>
            <circle
              role="button"
              tabIndex={0}
              aria-label={`Mês ${p.month}: ${format(p.value)}${financial ? "" : " avaliações estimadas"}. ${premises}`}
              cx={x(p.month)}
              cy={y(p.value)}
              r="14"
              fill="transparent"
              onFocus={() => setActive(p.month)}
              onPointerEnter={() => setActive(p.month)}
              onClick={() => setActive(p.month)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(p.month);
                }
              }}
            />
            <circle
              cx={x(p.month)}
              cy={y(p.value)}
              r={selected.month === p.month ? 5 : 3}
              fill="currentColor"
              pointerEvents="none"
            />
            {(series.length < 8 ||
              p.month % 2 === 0 ||
              p.month === series.length - 1) && (
              <text x={x(p.month)} y="267" textAnchor="middle">
                {p.month}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-axis">Tempo (meses)</div>
      <label className="chart-explore" htmlFor={selectId}>
        Explorar mês
        <select
          id={selectId}
          aria-label={
            financial
              ? "Explorar mês financeiro"
              : "Explorar mês das avaliações"
          }
          value={selected.month}
          onChange={(e) => setActive(Number(e.target.value))}
        >
          {series.map((p) => (
            <option key={p.month} value={p.month}>
              Mês {p.month}
            </option>
          ))}
        </select>
      </label>
      <div className="chart-tooltip" role="status">
        <strong>
          Mês {selected.month} · {format(selected.value)}
          {financial ? "" : " avaliações estimadas"}
        </strong>
        <span>{premises}</span>
      </div>
      <details className="table-toggle">
        <summary>Ver os dados em tabela</summary>
        <table>
          <caption>
            {financial
              ? "Saldo incremental simulado"
              : "Avaliações estimadas acumuladas"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col">{financial ? "Saldo (R$)" : "Avaliações"}</th>
            </tr>
          </thead>
          <tbody>
            {series.map((p) => (
              <tr key={p.month}>
                <th scope="row">{p.month}</th>
                <td>{format(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
