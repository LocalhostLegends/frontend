# Getting started

Frontend for the **HR Tech** project — **Angular 21** and **Angular Material**.

## Tech stack

- **Framework:** [Angular](https://angular.dev) (v21.x)
- **UI:** [Angular Material](https://material.angular.io)
- **Environment:** Node.js v20.x (LTS)
- **Package manager:** npm

## Clone and run

### 1. Clone the repository

```bash
git clone https://github.com/LocalhostLegends/frontend.git
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm start
```

Open http://localhost:4200/. The app reloads when you change source files.

## Development workflow (Git)

### 1. Create a feature branch from `main`

```bash
git checkout -b feature/your-feature-name
```

### 2. Commit with clear messages

```bash
git add .
git commit -m "feat: your-feature-description"
```

### 3. Push and open a Pull Request

```bash
git push -u origin feature/your-feature-name
```

On GitHub, use **Compare & pull request**, describe changes, and wait for review.

## Commit messages (Conventional Commits)

- `feat:` — new feature (e.g. `feat: add user profile sidebar`)
- `fix:` — bug fix (e.g. `fix: navigation menu layout on mobile`)
- `docs:` — docs only (e.g. `docs: update readme`)
- `style:` — formatting, whitespace (no logic change)
- `refactor:` — refactor without fixing or adding features
- `perf:` — performance
- `chore:` — build, tooling, deps (e.g. `chore: install material icons`)

**Example:** `git commit -m "feat: integrate material data table for users list"`

## Branch naming

- `feature/` — new features or UI
- `bugfix/` — bug fixes
- `hotfix/` — production hotfixes
- `refactor/` — structural / cleanup
- `docs/` — documentation only

**Example:** `git checkout -b feature/short-description`

## Useful commands

- `npm start` — dev server (http://localhost:4200)
- `npx ng generate component name --type=component` — new component (HTML, SCSS, TS, spec)
- `npx ng generate service name` — new service (API / shared logic)
- `npx ng build` — production build → `dist/`
- `npx ng test` — unit tests
- `npm run lint` — ESLint + import path rules

## Imports and path aliases

Avoid deep relative imports (`../../`, `../../../`, …). Use aliases from `tsconfig.json`:

| Alias | Maps to |
|--------|---------|
| `@app/*` | `src/app/*` |
| `@environments/*` | `src/environments/*` |

```ts
import { AuthService } from '@app/core/services/auth.service';
import { environment } from '@environments/environment';
```

Within the same feature, short relatives are fine (`./`, one `../` to a sibling). For **core**, **other features**, or **environments**, use the aliases.

**SCSS:** `@use 'variables' as *;` (`includePaths` includes `src`). Do not use `../../../../variables`.

**Lint:** `npm run lint` runs `scripts/check-import-paths.mjs` for these rules.

## Project structure (`src/app/`)

For layering, dependency direction, and where to put new files, see [Architecture](./architecture.md).

```text
src/app/
├── core/                   # Singleton services, global configuration, guards
│   ├── guards/             # Route guards (e.g. AuthGuard, RoleGuard)
│   ├── interceptors/       # HTTP interceptors
│   ├── services/           # Global services (e.g. AuthService)
│   ├── layouts/            # App shell (header, sidebar, layout)
│   └── models/             # Shared domain types (e.g. User, Config)
├── shared/                 # Reusable UI, pipes, directives
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── models/             # Shared UI types
├── features/               # Business features (often lazy-loaded)
│   ├── landing/            # Public pages
│   ├── auth/               # Login, register, activation
│   ├── candidates/
│   └── dashboard/
└── app.routes.ts           # Route configuration
```

### Empty folders (`.gitkeep`)

Git does not track empty directories. A `.gitkeep` file may exist only to keep a folder in the repo; remove it after you add real files there.

**Example: first component in `shared`**

1. `ng generate component shared/components/header`
2. Remove `.gitkeep` from `shared` if the folder is no longer empty
3. `git add .` and commit
