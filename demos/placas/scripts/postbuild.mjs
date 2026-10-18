import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
mkdirSync("dist/demonstracao", { recursive: true });
const html = readFileSync("dist/index.html", "utf8");
writeFileSync("dist/demonstracao/index.html", html.replaceAll('="./', '="../'));
