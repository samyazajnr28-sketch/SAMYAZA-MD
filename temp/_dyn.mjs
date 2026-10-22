import fs from 'node:fs';
import path from 'node:path';

const root = 'c:/Users/SAMYAZA/Desktop/SETH/SAMYAZA-MD';
const pdir = path.join(root, 'plugins');
const libDir = path.join(root, 'lib');

// Find plugins using DYNAMIC import of a missing module (load fine, fail at runtime)
const broken = [];
for (const f of fs.readdirSync(pdir).filter(x => x.endsWith('.js'))) {
    const t = fs.readFileSync(path.join(pdir, f), 'utf8');
    // dynamic imports: await import("...") or import("...")
    for (const m of t.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = m[1];
        if (!spec.startsWith('.')) continue;
        const resolved = path.resolve(pdir, spec);
        if (!fs.existsSync(resolved)) {
            broken.push(`${f.replace('.js', '')} -> dynamic import of MISSING ${spec.replace('../', '')}`);
        }
    }
}

// Also: any static import of a lib file that exists but exports something missing?
// Check lib/lightweight_store.js default export and lib/index.js
const out = [];
out.push(`=== RUNTIME-BROKEN (dynamic import of missing module): ${broken.length} ===`);
for (const b of broken.sort()) out.push(b);

out.push('');
out.push('=== lib/ contents ===');
out.push(fs.readdirSync(libDir).join(', '));

out.push('');
out.push('=== does lib/index.js exist? ===');
out.push(String(fs.existsSync(path.join(libDir, 'index.js'))));

fs.writeFileSync(path.join(root, 'temp/_dyn.txt'), out.join('\n'));
console.log('done');
