import { test } from "node:test";
import assert from "node:assert/strict";
import jsQR from "jsqr";
import { demonstrationUrl, qrGeometry } from "../src/qr";
test("QR real decodifica o caminho demonstrativo na origem local e publicada", () => {
  for (const [origin, base] of [
    ["http://127.0.0.1:5173", "/"],
    ["https://montes-objetos-de-conexao.jazzy-crane-3889.chatgpt.site", "/"],
    ["https://devsmontes.github.io", "/montes/sistemas/placas/"],
    ["https://montes.dev", "/sistemas/placas/"],
  ]) {
    const qr = qrGeometry(origin, base),
      scale = 8,
      width = qr.size * scale;
    const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
    for (const match of qr.path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      const x = Number(match[1]),
        y = Number(match[2]);
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const i = ((y * scale + dy) * width + x * scale + dx) * 4;
          pixels[i] = 23;
          pixels[i + 1] = 43;
          pixels[i + 2] = 37;
        }
    }
    const decoded = jsQR(pixels, width, width);
    assert.equal(decoded?.data, demonstrationUrl(origin, base));
    assert.ok(decoded?.data.endsWith("/demonstracao/"));
  }
});
