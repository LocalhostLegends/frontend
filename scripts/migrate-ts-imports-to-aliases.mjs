/**
 * One-off helper — prefer editing imports manually. Safe replacements only:
 * - …/core/… -> @app/core/…
 * - …/environments/… -> @environments/…
 * Do NOT blanket-replace ../services/, ../models/, ../utils/ (feature-local paths break).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');

function walkTs(dir, acc = []) {
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) {
            walkTs(p, acc);
        } else if (p.endsWith('.ts') && !p.endsWith('.d.ts')) {
            acc.push(p);
        }
    }
    return acc;
}

function migrate(content) {
    let c = content;
    const rules = [
        [/from (['"])(\.\.\/)+core\//g, 'from $1@app/core/'],
        [/from (['"])(\.\.\/)+environments\//g, 'from $1@environments/'],
        [/from (['"])(\.\.\/)+constants\//g, 'from $1@app/core/constants/'],
        [/from (['"])(\.\.\/)+ui\//g, 'from $1@app/core/ui/'],
        [/from (['"])(\.\.\/)+api\//g, 'from $1@app/core/api/'],
        [/from (['"])(\.\.\/)+guards\//g, 'from $1@app/core/guards/'],
        [/from (['"])\.\.\/\.\.\/invites\//g, 'from $1@app/features/invites/'],
        [/from (['"])\.\.\/\.\.\/\.\.\/invites\//g, 'from $1@app/features/invites/'],
        [
            /from (['"])\.\.\/\.\.\/components\/landing-header\/landing-header\.component(['"])/g,
            "from $1@app/features/landing/components/landing-header/landing-header.component$2",
        ],
    ];
    for (const [re, rep] of rules) {
        c = c.replace(re, rep);
    }
    return c;
}

for (const file of walkTs(srcRoot)) {
    const orig = fs.readFileSync(file, 'utf8');
    const next = migrate(orig);
    if (next !== orig) {
        fs.writeFileSync(file, next);
        console.log(path.relative(root, file));
    }
}
