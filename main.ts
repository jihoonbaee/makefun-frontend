import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const source = fileURLToPath(new URL('.', import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(destination, { recursive: true });
for (const folder of ['app', 'screenshots']) {
  cpSync(join(source, folder), join(destination, folder), { recursive: true });
}
const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(destination, 'dossier.json'), dossier);
console.log(`Dossier built: ${dossier.byteLength} bytes; app and screenshots copied.`);
