// Valide la syntaxe des schémas avec le parseur de Mermaid 10, celui du site.
// Usage : node check_syntax.mjs courses/grafana courses/docker/docker_ch1_0.md
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false });

function markdownFiles(target) {
  if (fs.statSync(target).isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

const targets = process.argv.slice(2);
if (!targets.length) {
  console.log('Usage : node check_syntax.mjs <dossier ou fichier> ...');
  process.exit(2);
}

let total = 0;
let invalid = 0;
for (const file of targets.flatMap(markdownFiles)) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  if (/^published:\s*false/m.test(text)) continue;
  for (const match of text.matchAll(/^```mermaid\n([\s\S]*?)^```/gm)) {
    total += 1;
    try {
      await mermaid.parse(match[1]);
    } catch (error) {
      invalid += 1;
      const line = text.slice(0, match.index).split('\n').length + 1;
      console.log(`${file}:${line}\n    ${String(error.message).split('\n').slice(0, 4).join('\n    ')}`);
    }
  }
}
console.log(`\n${total} schéma(s), ${invalid} invalide(s). Version de Mermaid : 10.`);
process.exit(invalid ? 1 : 0);
