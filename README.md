# vpankaj.com

Personal portfolio and blog of **Vetcha Pankaj Nath** — a full-stack developer and final-year CSE undergrad at IIT Kanpur, joining InMobi as SDE-1.

Built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com), adapted from the [AstroPaper](https://github.com/satnaing/astro-paper) template. Deployed via **GitHub Pages** at **[vpankaj.com](https://vpankaj.com)**.

---

## 🧱 Project Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml          # PR checks: lint, format, build (pnpm)
│       └── deploy.yml      # Deploy to GitHub Pages on push to main
├── public/                 # Static assets (favicons, CNAME, fonts, pagefind index)
├── src/
│   ├── assets/             # Icons (SVG) and images (logo, avatar)
│   ├── components/         # Reusable Astro components
│   ├── config.ts           # Site-wide configuration (SITE object)
│   ├── constants.ts        # Social links and share-link definitions
│   ├── content.config.ts   # Astro content collections (blog, notes, recipes)
│   ├── data/               # Markdown content
│   │   ├── blog/           # Blog posts
│   │   ├── notes/          # Technical notes (drafts)
│   │   └── recipes/        # Vegetarian recipes (drafts)
│   ├── layouts/            # Page layouts (Layout, Main, PostDetails, AboutLayout)
│   ├── pages/              # Route definitions (index, posts, notes, recipes, tags, etc.)
│   ├── styles/             # Global CSS and typography (Tailwind + prose)
│   └── utils/              # Helpers, OG image generation, Shiki transformers
├── astro.config.ts         # Astro config (markdown, sitemap, env, Vite)
├── package.json            # Dependencies & scripts
├── pnpm-lock.yaml          # Lockfile (pnpm is the primary package manager)
└── tsconfig.json           # TypeScript config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (preferred) — the CI pipeline uses pnpm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/might-guy106/vpankaj-portfolio.git
cd vpankaj-portfolio

# Install dependencies
pnpm install

# Start dev server
pnpm dev
# → http://localhost:4321
```

### Available Scripts

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `pnpm dev`           | Start Astro dev server                           |
| `pnpm build`         | Type-check → build → run Pagefind search index   |
| `pnpm preview`       | Preview the production build locally             |
| `pnpm sync`          | Generate Astro types                             |
| `pnpm format`        | Format code with Prettier                        |
| `pnpm format:check`  | Check formatting (CI)                            |
| `pnpm lint`          | Lint with ESLint                                 |

---

## ✍️ Writing Content

Content lives under `src/data/` and uses **three collections**:

### 1. Blog Posts (`src/data/blog/`)

Create a `.md` file with this frontmatter:

```yaml
---
author: Pankaj Nath
pubDatetime: 2026-01-09T13:26:02.000+05:30
modDatetime:          # optional — set when updating
title: Your Post Title
featured: true        # optional
draft: false          # set true to hide from production
tags:
  - tag-one
  - tag-two
description: A short description for preview cards and SEO
ogImage: ./image.png  # optional — local image or URL
---
```

- Files starting with `_` (e.g., `_draft-idea.md`) are **ignored** by the glob loader.
- Draft posts (`draft: true`) are excluded from production builds but visible in `pnpm dev`.

### 2. Notes (`src/data/notes/`)

Same schema as blog posts, with extra optional fields:

```yaml
topics: ["Databases", "Distributed Systems"]   # Research areas
papers: ["Paper Title 1", "Paper Title 2"]     # Related papers
```

### 3. Recipes (`src/data/recipes/`)

Extra fields for cooking metadata:

```yaml
prepTime: "20 mins"
cookTime: "30 mins"
servings: 4
difficulty: "medium"       # easy | medium | hard
cuisine: "Indian"
```

---

## 🛠 Site Configuration

Edit [`src/config.ts`](src/config.ts) to update site-wide settings:

| Key                    | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `website`              | Deployed domain (used for sitemap, RSS, OG)    |
| `title`                | Site title (shown in browser tab)              |
| `author`               | Default author for posts                       |
| `desc`                 | Meta description & default OG description      |
| `lightAndDarkMode`     | Enable/disable theme toggle                    |
| `postPerIndex` / `postPerPage` | Pagination settings                    |
| `showArchives`         | Enable archives page (year/month grouping)     |
| `showBackButton`       | Show back button on post detail pages          |
| `dynamicOgImage`       | Auto-generate OG images with Satori            |
| `timezone`             | Default timezone (e.g., `Asia/Kolkata`)        |

---

## 🎨 Theming

Dark/light mode is handled via:

- **CSS custom properties** in [`src/styles/global.css`](src/styles/global.css)
- **`toggle-theme.js`** in `public/` — sets `data-theme` attribute on `<html>`
- Toggle button in the header (sun/moon icons)
- Default preference: `"dark"` (set in `toggle-theme.js` line 1), overridden by `localStorage` and system preference

To change colors, edit the CSS variables in `:root` (light) and `html[data-theme="dark"]` blocks.

---

## 🔍 Search

Full-text search is powered by [Pagefind](https://pagefind.app). The search index is generated during `pnpm build` and copied to `public/pagefind/`.

> **Note:** Search only works after a production build. In dev mode, the search page shows a warning.

---

## 🖼 Dynamic OG Images

When `dynamicOgImage` is enabled (default), post OG images are auto-generated using [Satori](https://github.com/vercel/satori). Custom OG images can be set per-post via the `ogImage` frontmatter field.

---

## 🚢 Deployment

This site is deployed to **GitHub Pages** via two workflows:

### [`deploy.yml`](.github/workflows/deploy.yml)

- **Trigger:** Push to `main`
- Uses [`withastro/action@v2`](https://github.com/withastro/action) to build
- Deploys to GitHub Pages via `actions/deploy-pages@v4`
- Package manager: **npm** (note: dev uses pnpm — see recommendations)

### [`ci.yml`](.github/workflows/ci.yml)

- **Trigger:** Pull requests (opened, edited, synchronized, reopened)
- Steps: Install (pnpm) → Lint → Format check → Build
- Prevents merging broken PRs

### Manual Deployment

```bash
pnpm build          # Build + pagefind index
pnpm preview        # Preview locally at http://localhost:4321
```

---

## 🐳 Docker (Optional)

A `Dockerfile` is included for containerized deployment, though the primary deployment target is GitHub Pages.

```bash
docker build -t portfolio .
docker run -p 80:80 portfolio
```

---

## 🔧 Tech Stack

| Category         | Technology                                  |
| ---------------- | ------------------------------------------- |
| Framework        | [Astro 5](https://astro.build)              |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com)  |
| Content          | Astro Content Collections (Markdown)        |
| Search           | [Pagefind](https://pagefind.app)            |
| Syntax Highlight | [Shiki](https://shiki.style)                |
| OG Images        | [Satori](https://github.com/vercel/satori)   |
| RSS              | [@astrojs/rss](https://docs.astro.build/en/guides/rss/) |
| Sitemap          | [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) |
| Type Checking    | [@astrojs/check](https://docs.astro.build/en/guides/typescript/) |
| Linting          | [ESLint](https://eslint.org)                |
| Formatting       | [Prettier](https://prettier.io)             |
| CI/CD            | GitHub Actions                              |
| Hosting          | GitHub Pages                                |
