import { appBase } from "../paths";
import { useId, useMemo } from "react";
import { demonstrationUrl, qrGeometry } from "../qr";
import type { Finish } from "../lib";
export function demoUrl() {
  return demonstrationUrl(window.location.origin, appBase);
}
export function QR({ large = false }: { large?: boolean }) {
  const path = useMemo(() => qrGeometry(window.location.origin, appBase), []);
  return (
    <svg
      className={large ? "qr large" : "qr"}
      viewBox={`0 0 ${path.size} ${path.size}`}
      role="img"
      aria-label="QR Code para a página de demonstração deste site"
      shapeRendering="crispEdges"
    >
      <rect width={path.size} height={path.size} fill="#ffffff" />
      <path d={path.path} fill="#222222" />
    </svg>
  );
}
export function NfcIcon() {
  return (
    <svg
      viewBox="0 0 42 42"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="13" height="23" rx="3" />
      <path d="M9 29h3M23 15q8 7 0 14m5-20q14 13 0 26m5-31q20 18 0 36" />
    </svg>
  );
}
export function Product({
  finish = "Preto",
  name = "Seu estabelecimento",
  message = "Conte como foi. Com sinceridade.",
  view = "front",
  className = "",
}: {
  finish?: Finish;
  name?: string;
  message?: string;
  view?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const light = finish === "Branco";
  return (
    <div
      className={`product-object ${light ? "white" : "black"} view-${view} ${className}`}
      role="img"
      aria-label={`Conceito vetorial da placa ${finish}, vista ${view === "base" ? "da base" : view === "detail" ? "do acabamento" : "frontal"}. ${name}. ${message}`}
    >
      <svg className="product-body" viewBox="0 0 600 700" aria-hidden="true">
        <defs>
          <linearGradient id={`body${id}`} x1="0" y1="0" x2="1" y2=".8">
            <stop stopColor={light ? "#FFFFFF" : "#555558"} />
            <stop offset=".17" stopColor={light ? "#FFFFFF" : "#17171A"} />
            <stop offset=".68" stopColor={light ? "#F5F5F7" : "#0B0B0D"} />
            <stop offset="1" stopColor={light ? "#DEDEE0" : "#17171A"} />
          </linearGradient>
          <linearGradient id={`edge${id}`} x1="0" y1="0" x2="1" y2=".5">
            <stop stopColor="#FFFFFF" />
            <stop offset=".2" stopColor={light ? "#B8B8BF" : "#59595F"} />
            <stop offset=".8" stopColor={light ? "#FFFFFF" : "#0B0B0D"} />
            <stop offset=".94" stopColor="#B8B8BF" />
            <stop offset="1" stopColor={light ? "#59595F" : "#17171A"} />
          </linearGradient>
          <linearGradient id={`stand${id}`} x2=".2" y2="1">
            <stop stopColor={light ? "#FFFFFF" : "#59595F"} />
            <stop offset="1" stopColor={light ? "#B8B8BF" : "#0B0B0D"} />
          </linearGradient>
          <radialGradient id={`shadow${id}`}>
            <stop stopColor="#0B0B0D" stopOpacity=".6" />
            <stop offset="1" stopColor="#0B0B0D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="302"
          cy="585"
          rx="240"
          ry="48"
          fill={`url(#shadow${id})`}
        />
        <g className="object-geometry">
          <path
            d="M109 530 428 518 498 575Q502 582 489 585L110 598Q97 595 100 584Z"
            fill={`url(#stand${id})`}
            stroke={light ? "#9a9a9a" : "#656565"}
          />
          <path
            d="M100 585 490 573 490 585 110 598Q97 597 100 585"
            fill={`url(#edge${id})`}
          />
          <rect
            x="149"
            y="58"
            width="309"
            height="490"
            rx="16"
            fill={`url(#edge${id})`}
          />
          <rect
            x="140"
            y="53"
            width="309"
            height="490"
            rx="16"
            fill={`url(#body${id})`}
            stroke={light ? "#f5f5f5" : "#7d7d7d"}
            strokeWidth="1.2"
          />
          <rect
            x="149"
            y="62"
            width="291"
            height="472"
            rx="11"
            fill="none"
            stroke={light ? "#f6f6f6" : "#bababa"}
            strokeOpacity=".16"
          />
          <path
            d="M144 182V70Q144 57 157 57H430"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={light ? ".9" : ".55"}
            strokeWidth="1.6"
          />
          <path
            d="M453 77V528Q453 541 441 542"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity=".75"
            strokeWidth="2"
          />
          <foreignObject x="170" y="81" width="248" height="435">
            <div className="plate-content">
              <div className="plate-brand">
                MONTES <span>/ CONEXÃO</span>
              </div>
              <div className="plate-name">
                {name.trim() || "Seu estabelecimento"}
              </div>
              <div className="plate-headline">
                Boas histórias
                <br />
                merecem ser
                <br />
                <em>compartilhadas.</em>
              </div>
              <div className="plate-message">
                {message.trim() || "Conte como foi. Com sinceridade."}
              </div>
              <div className="plate-actions">
                <div>
                  <NfcIcon />
                  <b>Aproxime.</b>
                  <small>NFC compatível</small>
                </div>
                <div>
                  <QR />
                  <b>Ou escaneie.</b>
                  <small>Acesse o convite</small>
                </div>
              </div>
              <div className="plate-footer">
                Sua opinião. Com sinceridade.<span>DEMONSTRAÇÃO</span>
              </div>
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
}
