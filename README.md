# EngineerX — AI Engineering Parts Catalog

A modern web application for browsing, managing, and exporting industrial engineering parts. 
## Features

- **Dashboard** — Catalog stats, usage charts, recent activity, and quick actions
- **Parts Catalog** — Search, filter, and browse parts; add new components; view part details
- **Export Catalog** — Generate PDF catalogs with configurable categories and options
- **AR Viewer** — 3D visualization for compatible parts
- **Settings** — Profile, catalog preferences, notifications, export defaults, security, and appearance

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Radix UI / shadcn-style components
- Recharts
- Lucide icons

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Install & run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run typecheck` | Run TypeScript without building |

Production output is written to the `dist/` folder.

## Login

Authentication uses the **NestJS API** (`AI Engineering Parts Catalog-api`). Start the backend before signing in.

**Default admin (first boot):**

| Field | Value |
|-------|-------|
| Email | `admin@engineerx.com` |
| Password | `ChangeMeOnFirstLogin!` |

You will be prompted to change the password on first login. Set `VITE_API_URL=/api` in `.env` (see `.env.example`); Vite proxies `/api` to `http://localhost:3000` in development.

## Production (Vercel + Render)

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://ai-engineering-parts-catalog-b9sk.vercel.app` |
| Backend (Render) | `https://ai-engineering-parts-catalog-api.onrender.com/api` |

Production builds call the Render API automatically. To override, set `VITE_API_URL` in the Vercel project **Environment Variables**.

On **Render**, set `FRONTEND_URL` or `CORS_ORIGINS` to your Vercel URL (see API `.env.example`). Preview deployments on `*.vercel.app` are allowed when `CORS_ALLOW_VERCEL=true`.

## Routes

| Path | Page |
|------|------|
| `/` | Login |
| `/dashboard` | Dashboard |
| `/catalog` | Parts Catalog |
| `/export` | Export Catalog |
| `/ar-viewer` | AR Viewer |
| `/settings` | Settings |

## Project Structure

```
src/
├── app/
│   ├── App.tsx              # Routes
│   ├── components/          # Pages and UI
│   │   ├── Dashboard.tsx
│   │   ├── Catalog.tsx
│   │   ├── Export.tsx
│   │   ├── Settings.tsx
│   │   ├── Login.tsx
│   │   └── ui/              # Shared UI components
│   └── lib/
│       └── mockData.ts      # Sample parts data
└── styles/                  # Global styles and theme
```

## Demo User

The app uses sample profile data in Settings and the header:

- **Name:** John Engineer
- **Role:** Senior Engineer
- **Email:** john.engineer@engineerx.com

## License

Private project — see repository owner for usage terms.
