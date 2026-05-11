/**
 * Lint: avoid deep relative imports (../../...) — use tsconfig aliases (@app/*, @environments/*)
 * and SCSS includePaths (@use 'variables').
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const srcRoot = join(projectRoot, 'src');

const tsImportFrom = /^\s*import\s+[^;]*?from\s+['"]([^'"]+)['"]/;
const scssUseLine = /^\s*@(use|forward)\s+["']([^"']+)["']/;

/** TypeScript: forbid two or more consecutive ../ in import path */
const tsDeepRelative = /(?:\.\.\/){2,}/;

function walk(dir, ext, files = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
            walk(p, ext, files);
        } else if (extname(p) === ext) {
            files.push(p);
        }
    }
    return files;
}

const errors = [];

for (const file of walk(srcRoot, '.scss')) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
        const t = line.trim();
        if (t.startsWith('//')) {
            return;
        }
        const m = line.match(scssUseLine);
        if (!m) {
            return;
        }
        const pathStr = m[2];
        if (pathStr.includes('../')) {
            errors.push({
                kind: 'scss',
                file: relative(projectRoot, file),
                line: i + 1,
                text: t,
            });
        }
    });
}

for (const file of walk(srcRoot, '.ts')) {
    if (file.endsWith('.d.ts')) {
        continue;
    }
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
        const t = line.trim();
        if (t.startsWith('//')) {
            return;
        }
        const m = line.match(tsImportFrom);
        if (!m) {
            return;
        }
        const pathStr = m[1];
        if (pathStr.startsWith('.') && tsDeepRelative.test(pathStr)) {
            errors.push({
                kind: 'ts',
                file: relative(projectRoot, file),
                line: i + 1,
                text: t,
            });
        }
    });
}

if (errors.length > 0) {
    console.error(
        [
            '',
            'Deep relative imports are forbidden (../../ or deeper).',
            'TypeScript: use @app/… and @environments/… (see tsconfig.json paths).',
            'SCSS: use @use \'variables\' as *; (angular.json includePaths: src).',
            '',
        ].join('\n'),
    );
    for (const e of errors) {
        console.error(`${e.file}:${e.line} [${e.kind}] ${e.text}`);
    }
    process.exit(1);
}
