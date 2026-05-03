# Обзор проекта HR Tech (фронтенд) — для автора

Документ описывает **как устроен репозиторий**, **где лежит логика** и **как данные и экраны связаны**. Актуально для текущей структуры `src/app` и маршрутов.

---

## 1. Что это за приложение

Одностраничное веб-приложение (**SPA**) на **Angular 21** с **Angular Material**. Оно подключается к **бэкенд API** (см. `src/environments`) — регистрация компании, вход, пользователи, отделы, приглашения, дашборд и т.д.

Точка входа: `src/main.ts` → подключает `app.config.ts` (роутер, HTTP, интерцептор) → корневой компонент `App` с `<router-outlet />`.

---

## 2. Технологии и конфиг

| Что | Где смотреть |
|-----|----------------|
| Роуты | `src/app/app.routes.ts` |
| Провайдеры (HTTP, Material-тема, скролл) | `src/app/app.config.ts` |
| URL API, production flag | `src/environments/*.ts` (сейчас `environment.ts` реэкспортирует `environment.development`) |
| Глобальные стили и токены CSS | `src/styles.scss`, `src/_variables.scss` |
| Алиасы импортов TypeScript | `tsconfig.json` → `paths`: `@app/*` → `src/app/*`, `@environments/*` → `src/environments/*` |
| Стили SCSS: короткий импорт токенов | `angular.json` → `stylePreprocessorOptions.includePaths: ["src"]` → в компонентах: `@use 'variables' as *;` |

**Запуск:** `npm start` → обычно `http://localhost:4200/`.

---

## 3. Две зоны интерфейса: «сайт» и «приложение»

### Публичная зона (без боковой панели приложения)

- **URL:** от корня: `/`, `/auth/login`, `/auth/register`, страницы активации/приглашения, forgot-password.
- **Оболочка:** `LandingLayoutComponent` — шапка лендинга, футер, внутри `<router-outlet>`.
- **Стартовая страница:** `HomeComponent` на пути `''` (главная с секциями about/product/contact в разметке).

### Зона приложения (после входа)

- **URL:** всё под префиксом `/app/...` (например `/app/dashboard`, `/app/employees`).
- **Оболочка:** `AppLayoutComponent` — **сайдбар** + **шапка** + область контента.
- **Защита:** на весь сегмент `app` вешается **`authGuard`** — без токена в `localStorage` на эти пути не пустит (редирект на логин).
- **По ролям:** на отдельных детях маршрута — **`roleGuard`** + `data: { roles: [...] }` из `ROUTE_ACCESS` в `routes.constants.ts`.

Итог: **сначала** проверяется «залогинен ли», **потом** «подходит ли роль для этой страницы».

---

## 4. Как работает авторизация (по коду)

1. **Логин/регистрация/акцепт инвайта** вызывают `AuthService` и `AuthApiService` / `InviteApiService`.
2. Успешный ответ с **JWT** → `AuthService` кладёт:
   - `accessToken` в **signal**;
   - `token` и JSON пользователя в **`localStorage`** (`user`), чтобы при обновлении страницы сессия восстановилась.
3. **`AuthInterceptor`** подставляет заголовок `Authorization: Bearer <token>` ко **всем** HTTP-запросам, кроме публичных путей приглашения (validate/accept), где токен ещё нет.
4. При **401** интерцептор очищает `localStorage` и ведёт на `/auth/login`.
5. **`authGuard`** на `/app` проверяет, что токен есть (через `AuthService.isAuthenticated()`).
6. **`roleGuard`** сравнивает роль пользователя с `ROUTE_ACCESS` для URL вида `/app/<страница>`.
7. **Выход:** `AuthService.logout()` — запрос на бэкенд (если доступен), очистка сигналов и `localStorage`, переход на `/auth/login` с `replaceUrl`.

Пользователь в памяти: **signals** `currentUser`, `accessToken` в `AuthService`; при обновлении профиля данные **мержатся** с тем, что пришло с API, чтобы не терялись поля вроде `companyName`.

---

## 5. Роли и что видит пользователь

### Где задано

- **Список ролей и хелперы** — `core/constants/roles.constants.ts` (`UserRole`, проверки типа «может ли HR редактировать отделы»).
- **Какая роль может зайти на какой маршрут** — `core/constants/routes.constants.ts` (`ROUTE_ACCESS`).
- **Пункты меню в сайдбаре** — `core/constants/menu.constants.ts` (`MENU_BY_ROLE`).

Роли: `super_admin`, `admin`, `manager`, `hr`, `employee`. У каждой роли своё меню; часть ссылок ведёт на заглушки, пока экран не реализован: для **клиентских** фич — `SectionPlaceholderComponent` в `core/pages`, для **платформенной админки** (`super_admin`) — общий компонент из `features/platform-admin` (см. ниже).

### Как это попадает в UI

- **Sidebar** берёт массив пунктов через `getMenuItemsByRole(role)` и строит навигацию.
- Маршруты в `app.routes.ts` для будущих экранов уже описаны; заголовки и подзаголовки для заглушек задаются в `data` маршрута (`title`, `subtitle`).

### Платформенная админка (`super_admin`)

**Назначение.** Роль **разработчик / поддержка**: глобальный обзор платформы (компании-клиенты, биллинг, лимиты, логи, тикеты и т.д.), не путать с **admin** компании (владелец одной организации).

**Где лежит код.** Вся фича платформенной админки собирается под **`src/app/features/platform-admin/`** — отдельно от экранов «одной компании» (`employees`, `invites`, `settings`, …). Зависимости: только **`core/`** и Angular/Material; другие `features/` не импортировать из `platform-admin`, чтобы не смешивать тенант и платформу.

**Текущая разметка маршрутов.** Для путей только с `super_admin` в `ROUTE_ACCESS` (`/app/companies`, `/app/users`, `/app/system-settings`, `/app/billing`, `/app/system-logs`, `/app/support-tickets`) в `app.routes.ts` используется lazy-загрузка **`PlatformAdminSectionComponent`** — страница-оболочка с заголовком из `route.data`. Файлы: `features/platform-admin/pages/admin-section/`.

**Как заменить заглушку на готовый экран.** Добавить компонент, например `features/platform-admin/pages/companies-list/`, подключить API в `core/api` (или сервис только для админки рядом с страницей, если контракт узкий). В `app.routes.ts` для нужного `path` заменить `loadComponent` с общей секции на lazy-импорт нового компонента; `ROUTE_ACCESS` и пункт в `MENU_BY_ROLE` для `super_admin` менять только если меняется URL или доступ.

**Дашборд.** Общий маршрут `/app/dashboard` доступен и `super_admin`; отдельные виджеты платформы (выручка, новые компании, топ активных компаний, статус серверов) логично добавлять в **`features/dashboard`**, в шаблоне по условию `userRole() === 'super_admin'`, с данными из отдельных эндпоинтов бэкенда.

**Бэкенд.** Доступ к «глобальным» данным только по проверке роли на сервере; фронт лишь скрывает пункты меню и маршруты.

---

## 6. Структура папок `src/app` (что где лежит)

```
core/           — инфраструктура всего приложения (не «бизнес-экраны»)
  api/          — HTTP-сервисы к REST API (auth, user, company, department, invite, …)
  constants/    — роли, меню, доступ к маршрутам
  guards/       — authGuard, roleGuard, pendingChangesGuard (несохранённые изменения в профиле)
  interceptors/ — подстановка JWT и обработка 401
  layouts/      — AppLayout (оболочка /app), LandingLayout, header, sidebar, shell-layout.service
  models/       — типы User, Invite, Department, Company, …
  pages/        — NotFound, SectionPlaceholder
  services/     — AuthService и другие синглтоны «на всё приложение»
  ui/           — переиспользуемые виджеты: loading-button, pagination, table-actions-menu, authenticated-img-src (аватар с заголовком Authorization)

features/       — фичи по областям продукта
  landing/      — лендинг: layout, header, home
  auth/         — login, register, forgot-password, activate-account
  dashboard/    — главный дашборд (виджеты по ролям), сервис загрузки данных, утилиты
  profile/      — профиль пользователя, аватар
  employees/    — список сотрудников, действия по ролям
  departments/  — отделы
  invites/      — приглашения, мастер создания приглашения
  settings/     — настройки (под роль admin по маршруту)
  platform-admin/ — админка платформы (роль super_admin): страницы и будущие сервисы для всех клиентов / биллинга / логов

shared/         — в этом проекте может быть пустым или минимальным; переиспользуемый UI без привязки к одной фиче обычно кладут сюда или в core/ui
```

**Зависимости между слоями:** фичи импортируют `core`; `core` не должен импортировать фичи (см. `docs/architecture.md`).

---

## 7. Основные экраны «что делают»

| Область | Файлы / маршрут | Назначение |
|---------|-----------------|------------|
| Главная публичная | `features/landing/pages/home`, `/` | Лендинг, ссылки на вход/регистрацию, якоря |
| Вход / регистрация | `features/auth/*`, `/auth/*` | Формы, вызов API, сохранение токена |
| Дашборд | `features/dashboard`, `/app/dashboard` | Виджеты зависят от роли (admin/hr/manager/employee), данные через `DashboardDataService` и API |
| Профиль | `features/profile`, `/app/profile` | Данные пользователя, аватар; guard при уходе с несохранёнными изменениями |
| Сотрудники | `features/employees`, `/app/employees` | Таблица, пагинация, меню действий по правилам HR/admin |
| Отделы | `features/departments`, `/app/departments` | CRUD в рамках прав |
| Приглашения | `features/invites`, `/app/invites` | Список инвайтов, диалоги, сервис `InviteService` |
| Настройки | `features/settings`, `/app/settings` | Экран настроек компании (доступ по `ROUTE_ACCESS`) |
| Платформенная админка | `features/platform-admin`, `/app/companies`, … | Только `super_admin`; см. раздел «Платформенная админка» выше |

---

## 8. HTTP и API

- Базовый URL задаётся в `environment.apiUrl`; сервисы в `core/api` дописывают пути (`/auth/login`, `/users/me`, …).
- Типичный паттерн: **inject** сервиса API в компонент или в оркестратор (`AuthService`, `DashboardDataService`).
- Ошибки сети/401 обрабатываются в интерцепторе и в компонентах (snackbar, текст ошибки).

---

## 9. Стили и тема

- **Дизайн-токены** (цвета, шрифт): `src/_variables.scss`; в компонентах — `@use 'variables' as *;`.
- **Глобально:** Material-тема и CSS-переменные `--app-*` в `src/styles.scss`.
- Тёмная тема: класс `dark-theme` на `body` (см. `app.component.ts`, переключение могло бы идти из localStorage `theme`).

---

## 10. Проверки качества (линт)

- `npm run lint` — ESLint для TS/HTML и скрипт **`scripts/check-import-paths.mjs`**: запрещает «глубокие» относительные импорты в TS (`../../` …) и `../` в `@use` SCSS; ожидаются алиасы `@app/…`, `@environments/…`, `@use 'variables'`.

---

## 11. Остальная документация в репозитории

| Файл | Содержание |
|------|------------|
| `docs/README.md` | Оглавление docs |
| `docs/getting-started.md` | Установка, Git, команды, импорты |
| `docs/architecture.md` | Слои и правила зависимостей |
| `docs/roles.md` | Роли, маршруты, меню (кратко) |
| `docs/ru-obzor-proekta.md` | Этот документ — обзор фронтенда по-русски |
| Корневой `README.md` | Кратко + ссылки на `docs/` |

---

## 12. На что смотреть при изменениях

- **Новый защищённый экран:** добавить маршрут под `path: 'app', children: [...]`, `canActivate: [roleGuard]`, запись в `ROUTE_ACCESS`, пункт в `MENU_BY_ROLE` для нужных ролей.
- **Новый экран только для super_admin:** компонент и стили класть в `features/platform-admin/`, маршрут — как у остальных детей `app`, роли — только `super_admin` в `ROUTE_ACCESS`.
- **Новый API:** класс в `core/api`, модель при необходимости в `core/models`.
- **Новые цвета/отступы:** расширить `_variables.scss` и при необходимости `:root` в `styles.scss`.


