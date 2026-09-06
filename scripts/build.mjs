// Static production build. No package installation or runtime dependencies required.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const project = fileURLToPath(new URL('../', import.meta.url));
const output = join(project, 'dist');
const entries = ['index.html', 'logomontes.png', 'assets', 'imagens', 'sistemas'];
for (const entry of entries) {
  if (!existsSync(join(project, entry))) throw new Error(`Missing required source: ${entry}`);
}
mkdirSync(output, { recursive: true });
for (const entry of entries) cpSync(join(project, entry), join(output, entry), { recursive: true });
console.log('Static build ready in dist/');
