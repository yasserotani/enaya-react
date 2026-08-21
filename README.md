# Enaya Admin Dashboard

React admin dashboard for **Enaya (عناية)** — a clinic management system. Connects to the [Enaya Laravel API](https://github.com/yasserotani/enaya-backend) to manage users, appointments, and clinic operations.

**Live demo:** [enayaadmin.netlify.app/dashboard](https://enayaadmin.netlify.app/dashboard)
> The dashboard requires login against the live Laravel API. If the backend (hosted on Railway) is cold or temporarily down, data may fail to load — refresh after a few seconds if that happens.

## Tech Stack

- **React** (Vite)
- **Tailwind CSS v4**
- **Zustand** (with `persist`) — state management, theme persistence
- **Axios** — API communication
- **React Router DOM v6** — navigation
- **React Hook Form** — form handling
- **MUI X Date Pickers v9** — date/time inputs
- **Recharts** — dashboard charts
- **shadcn/ui** — UI components
- **Laravel Sanctum** — token-based auth against the backend API

## Features

**Implemented**
- Authentication flow (login, token storage, protected routes)
- App layout and routing
- Persistent dark/light theme toggle
- Patients page with modal-based create/edit forms and date pickers
- Dashboard KPI widgets (scaffolded, connected to backend metrics)
- Full appointments management UI
- Queue monitoring
- Fine-grained role-based access control (Admin / Doctor / Receptionist views)
- Doctor and department management screens

## Getting Started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

## Related Repositories

- [`enaya-backend`](https://github.com/yasserotani/enaya-backend) — Laravel REST API
- `enaya-mobile` — Flutter apps for Doctor, Receptionist, and Patient roles

## License

This project is part of an academic graduation project and is not currently licensed for external use.
