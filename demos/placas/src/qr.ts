import QRCode from "qrcode";
export const demonstrationUrl = (origin: string, base = "/") =>
  new URL(`${base}demonstracao/`, origin).href;
export function qrGeometry(origin: string, base = "/") {
  const modules = QRCode.create(demonstrationUrl(origin, base), {
    errorCorrectionLevel: "M",
  }).modules;
  let path = "";
  for (let y = 0; y < modules.size; y++)
    for (let x = 0; x < modules.size; x++)
      if (modules.get(y, x)) path += `M${x + 4} ${y + 4}h1v1h-1z`;
  return { path, size: modules.size + 8 };
}
