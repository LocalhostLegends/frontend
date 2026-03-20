# HR Tech Frontend

This is the frontend application for the **HR Tech** project, built with **Angular 19** and **Angular Material**.

## 🛠 Tech Stack
- **Framework:** [Angular 15+](https://angular.dev) (Current: v19.x)
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


## Project Structure
* src/app/ — Application components, services, and modules.
* src/assets/ — Static assets (images, fonts, etc.).
* src/styles.scss — Global styles and Angular Material theme configuration.

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
- `ng generate component name` — **Create a new UI part**. It automatically creates 4 files (HTML, CSS, TS, Spec) and links them.
- `ng generate service name` — **Create a data service**. Use this for API calls or shared logic between components.
- `ng build` — **Prepare for production**. It creates a `dist/` folder with optimized files for the web server.
- `ng test` — **Run tests**. It checks if your code works as expected (using Karma runner).

