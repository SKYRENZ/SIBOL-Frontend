import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..', 'src');
const API_CLIENT = path.join(ROOT, 'services', 'apiClient.ts');

function walk(dir) {
  const list = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) list.push(...walk(p));
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) list.push(p);
  }
  return list;
}

function computeImportPath(file) {
  const rel = path.relative(path.dirname(file), API_CLIENT).replace(/\\/g, '/');
  let imp = rel;
  if (!imp.startsWith('.')) imp = './' + imp;
  imp = imp.replace(/\.ts$|\.js$/, '');
  return imp;
}

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('fetch(')) continue;

  const hasFetchJsonImport = /import\s+{[^}]*\bfetchJson\b[^}]*}\s+from\s+['"][^'"]+['"]/m.test(src)
    || (/\bfetchJson\b/.test(src) && /import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"]/m.test(src));

  // conservative replacement: word-boundary fetch(
  const newSrc = src.replace(/\bfetch\(/g, 'fetchJson(');
  if (newSrc === src) continue;

  let final = newSrc;

  if (!hasFetchJsonImport) {
    const importPath = computeImportPath(file);
    const importMatches = [...final.matchAll(/^import .*$/mg)];
    if (importMatches.length > 0) {
      const last = importMatches[importMatches.length - 1];
      const insertAt = last.index + last[0].length;
      final = final.slice(0, insertAt) + '\nimport { fetchJson } from \'' + importPath + '\';' + final.slice(insertAt);
    } else {
      final = "import { fetchJson } from '" + importPath + "';\n" + final;
    }
  }

  fs.writeFileSync(file, final, 'utf8');
  changed++;
  console.log('Patched:', path.relative(process.cwd(), file));
}

console.log('Done. Files changed:', changed);
console.log('Please review changes (git diff) before committing.');