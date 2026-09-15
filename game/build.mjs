/* Bundles game/src/* into one self-contained ChemEngQuest.html
   run: node game/build.mjs                                      */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src  = join(here, 'src');

const css = readFileSync(join(src, '00-style.css'), 'utf8');

const js = readdirSync(src)
  .filter(f => f.endsWith('.js'))
  .sort()
  .map(f => `/* ===== ${f} ===== */\n` + readFileSync(join(src, f), 'utf8'))
  .join('\n\n');

const shell = readFileSync(join(src, 'shell.html'), 'utf8');

const out = shell
  .replace('/*__CSS__*/', () => css)
  .replace('/*__JS__*/',  () => '(()=>{\n"use strict";\n' + js + '\n})();');

const dest = join(here, 'ChemEngQuest.html');
writeFileSync(dest, out);
console.log(`built ${dest}  (${(out.length/1024).toFixed(0)} KB)`);
