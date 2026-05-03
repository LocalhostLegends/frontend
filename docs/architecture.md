# Architecture

This document defines where services and interfaces should live in `src/app`.

## Layer intent

- `core/`  
  Global app infrastructure and singleton logic: API clients, auth/session state, guards, interceptors, layouts, app-level models.

- `features/`  
  Business features and screens: components, feature orchestration services, feature-specific widgets/view models.

- `shared/`  
  Reusable UI building blocks and utilities without business-specific dependencies.

Landing-only chrome (header, shell layout around public routes) lives under `features/landing/` — not `shared/` — when it is not reused elsewhere.  
Routing-level pages such as `NotFoundComponent` live under `core/pages/`.

The app router may import layout components from `features`; `core/` must still not depend on `features/` (layouts that wrap a single feature belong next to that feature).

## Imports (path aliases)

Use **`@app/…`** and **`@environments/…`** instead of long `../../` chains (see root `tsconfig.json` `paths`). Same-feature imports may use `./` or a single `../` when staying inside that feature.

Do not reference shared tokens via deep paths in SCSS — use `@use 'variables' as *;`.

## Dependency direction

- Allowed:
  - `features -> core`
  - `features -> shared`
  - `shared -> core/models` (types only, if needed)
- Not allowed:
  - `core -> features`
  - `shared -> features`

If a type is required by multiple features or by core API clients, place it in `core/models`.

## Where to put services

- `core/services` — app-wide singleton tied to global state (e.g. auth/session).
- `core/api` — HTTP/API clients only (no UI decisions).
- `features/<feature>/services` — orchestrates one feature’s use cases.
- Do not duplicate the same responsibility in both `core` and `features`.

## Where to put interfaces and types

- API envelope / shared response shapes → `core/api/api-types.ts`
- Cross-feature domain models (`User`, `Invite`, …) → `core/models`
- Feature-local view-models and widget contracts → `features/<feature>/models`

## Quick checklist before adding code

- Needed by multiple features or core APIs? → `core`.
- Only one screen/feature flow? → that `features/*` folder.
- Import violates dependency direction? → fix before merge.
- Already a service/model for this? → reuse.

## Швидка шпаргалка українською

- `core/` — загальносистемні речі: API-клієнти, global services, guards, interceptors, layouts, shared domain models, routing-level pages.
- `features/` — окремі бізнес-фічі (`auth`, `dashboard`, `invites`, `landing`): компоненти, локальні сервіси, моделі.
- `shared/` — перевикористовуваний UI без бізнес-залежностей.

### Куди класти новий файл

- Потрібен у кількох фічах або в core API → `core`.
- Тільки в межах однієї фічі → `features/<feature>/...`.
- Універсальний UI без прив’язки до ролей → `shared`.
- Системна сторінка роутингу (наприклад 404) → `core/pages`.
