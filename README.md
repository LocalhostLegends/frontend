# HR Tech Frontend

This is the frontend application for the **HR Tech** project, built with **Angular 21** and **Angular Material**.

## 🛠 Tech Stack
- **Framework:** [Angular 15+](https://angular.dev) (Current: v21.x)
- **UI Library:** [Angular Material](https://material.angular.io) 
- **Environment:** Node.js v20.x (LTS)
- **Package Manager:** npm

##  Getting Started

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

Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

##  Development Workflow (Git Flow)
To keep the main branch stable, please follow these steps:

### 1. Create a feature branch from main:
```bash
git checkout -b feature/your-feature-name
```

### 2. Commit your changes with clear messages:
```bash
git add .
git commit -m "feat: your-feature-description"
``` 

### 3. Push to GitHub and create a Pull Request:
```bash
git push -u origin feature/your-feature-name
```
### 4. Create a Pull Request (PR)
Go to the GitHub repository page and click the green "Compare & pull request" button. Describe your changes and wait for a code review from the team.

## Commit Message Guidelines
We follow the [Conventional Commits](https://www.conventionalcommits.org) specification:

- `feat:` — A new feature (e.g., `feat: add user profile sidebar`)
- `fix:` — A bug fix (e.g., `fix: navigation menu layout on mobile`)
- `docs:` — Documentation changes only (e.g., `docs: update readme`)
- `style:` — Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor:` — A code change that neither fixes a bug nor adds a feature
- `perf:` — A code change that improves performance
- `chore:` — Updating build tasks, package manager configs, etc. (e.g., `chore: install material icons`)

**Example:**
`git commit -m "feat: integrate material data table for users list"`

##  Branch Naming Convention
To keep our repository organized, please use the following prefixes for branch names:

- `feature/` — New features or UI components (e.g., `feature/login-form`)
- `bugfix/` — Fixing a bug (e.g., `bugfix/header-mobile-view`)
- `hotfix/` — Critical fixes for the production (e.g., `hotfix/api-url-error`)
- `refactor/` — Code cleanup or structural changes (e.g., `refactor/api-services`)
- `docs/` — Documentation updates only (e.g., `docs/update-readme`)

**How to create a new branch:**
`git checkout -b feature/short-description`

## 🛠 Useful Commands
Inside the project folder, you can run:

- `npm start` — **Run the app** in development mode. Open [http://localhost:4200](http://localhost:4200) to view it in the browser.
- `npx ng generate component name --type=component` — **Create a new UI part**. It automatically creates 4 files (HTML, CSS, TS, Spec) and links them.
(ex: npx ng g c shared/components/component-name --type=component)
- `npx ng generate service name` — **Create a data service**. Use this for API calls or shared logic between components.
- `npx ng build` — **Prepare for production**. It creates a `dist/` folder with optimized files for the web server.
- `npx ng test` — **Run tests**. It checks if your code works as expected (using Karma runner).

##  Project Structure
Inside `src/app/`, we use the following organization:

```text
src/app/
├── core/                   # Singleton services, global configurations, and guards
│   ├── guards/             # Route guards (e.g., AuthGuard, RoleGuard)
│   ├── interceptors/       # HTTP Interceptors (e.g., AuthToken, ErrorHandler)
│   ├── services/           # Global services (e.g., AuthService, ApiService, ThemeService)
│   ├── layouts/            # Main layout wrappers (e.g., MainLayout, AuthLayout)
│   └── models/             # Global TypeScript interfaces (e.g., User, Config)
├── shared/                 # Reusable UI elements, pipes, and directives
│   ├── components/         # "Dumb" components (e.g., CustomButton, InputField, Modal)
│   ├── directives/         # Custom attribute/structural directives
│   ├── pipes/              # Formatting utilities (e.g., DateFormat, Currency)
│   └── models/             # Shared UI models (e.g., TableColumn, SelectOption)
├── features/               # Business logic modules (Lazy-loaded modules)
│   ├── landing/            # Public Landing Page (Home, About, Hero section)
│   │   ├── components/     # Landing-specific UI (PricingTable, Testimonials)
│   │   └── landing.component.ts
│   ├── auth/               # Authentication pages (Login, Register, Password Reset)
│   ├── candidates/         # Candidates management feature
│   │   ├── components/     # Internal UI (CandidateCard, CandidateFilter)
│   │   ├── services/       # Local services specific to candidates data
│   │   ├── models/         # Domain-specific interfaces (Candidate)
│   │   └── candidates.component.ts
│   └── dashboard/          # Internal application dashboard
└── app-routing.module.ts   # Main routing configuration
```
### 💡 Note on Empty Folders (`.gitkeep`)
Git does not track empty folders. To keep our project structure visible on GitHub, you might see small files called `.gitkeep` inside some folders.

- **Why are they there?** Just to make sure the folder exists in the repository.
- **When to delete?** Once you create a real file (component, service, etc.) inside that folder, you can safely **delete** the `.gitkeep` file.


**Example: Creating your first component**
1. Pick a folder (e.g., `src/app/shared/`).
2. Generate your component:

   ```bash
   ng generate component shared/components/header
   ```

3. Once the new files (header.component.ts, etc.) are created, delete the .gitkeep file from the shared folder.
4. Commit your changes:

```bash
git add .
git commit -m "feat: add header component and remove placeholder"
```

Note: If a folder contains at least one real file, it doesn't need a .gitkeep anymore!
