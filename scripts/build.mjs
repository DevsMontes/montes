import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const output = join(project, 'dist');
const clientOutput = join(output, 'client');
const serverOutput = join(output, 'server');
const entries = ['index.html', 'logomontes.png', 'assets', 'imagens', 'sistemas'];

for (const entry of entries) {
  if (!existsSync(join(project, entry))) throw new Error(`Fonte obrigatória ausente: ${entry}`);
}
if (!existsSync(join(project, 'server', 'index.js'))) throw new Error('Backend da AltriX ausente.');

rmSync(output, { recursive: true, force: true });
mkdirSync(clientOutput, { recursive: true });
mkdirSync(serverOutput, { recursive: true });
for (const entry of entries) cpSync(join(project, entry), join(clientOutput, entry), { recursive: true });
cpSync(join(project, 'server', 'index.js'), join(serverOutput, 'index.js'));
console.log('Site e backend preparados em dist/.');
