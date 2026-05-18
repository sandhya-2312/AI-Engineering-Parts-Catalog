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

Authentication is **mocked** for demo purposes. There is no backend validation — any email and password will work as long as both fields are filled.

**Example credentials:**

| Field | Value |
|-------|-------|
| Email | `engineer@company.com` |
| Password | `password123` |

Click **Sign In** to access the dashboard.

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
