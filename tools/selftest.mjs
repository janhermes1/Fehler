// Führt den Selbsttest des Rechenkerns ohne Browser aus: node tools/selftest.mjs
// Der Kern steht in fehlersimulator.html zwischen /*<CORE>*/ und /*</CORE>*/.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = fileURLToPath(new URL('../fehlersimulator.html', import.meta.url));
const html = readFileSync(file, 'utf8');
const a = html.indexOf('/*<CORE>*/'), b = html.indexOf('/*</CORE>*/');
if (a < 0 || b < 0) { console.error('CORE-Markierungen nicht gefunden'); process.exit(2); }

const verbose = process.argv.includes('-v');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(html.slice(a, b) + '\nthis.__selfTest = selfTest;', ctx);
const lines = [];
const { pass, total } = ctx.__selfTest(l => lines.push(l));
for (const l of lines) if (verbose || !l.startsWith('PASS')) console.log(l);
process.exit(pass === total ? 0 : 1);
