# Freq Dashboard Frontend

Vue 3 + Vite frontend for the frequency/device dashboard.  
This project is a Vue migration of the older Limitless-based static frontend and keeps the same visual style while moving the app to a proper component/router structure.

## Stack

- Vue 3
- Vue Router
- Vite
- Limitless template assets
- DataTables
- ECharts
- SweetAlert2

## Features

- Login page backed by `/api/auth/login`
- Dashboard home page with:
  - total devices
  - online devices
  - total groups
  - live group charts
  - grouped devices table
- One-device statistics page with:
  - live WebSocket updates
  - CPU frequency timeline
  - fixed session summary cards
  - crashes during fixed sessions / outside fixed sessions
  - app stats, crashes, and command history
- Licences page
- Report selection page
- Admin/user role-aware UI

## Project Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Environment

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_API_BASE_URL=https://127.0.0.1:3000/api
VITE_WS_BASE_URL=wss://127.0.0.1:3000/dashboard
```

For remote testing, point these values to your public backend host.

## Backend Requirements

This frontend expects the backend project to provide:

- JWT login via `/api/auth/login`
- dashboard REST endpoints under `/api/dashboard`
- dashboard WebSocket endpoint

The backend repo used during development lives separately in:

- `C:\Users\PC\Desktop\freq`

## Main Pages

- `/` or `/login` - Login
- `/home` - Dashboard
- `/licences` - Licences
- `/device` - Report generator
- `/one-device?id=<deviceId>` - One-device statistics

## Notes

- Limitless assets are served from `public/assets` and `public/assets2`
- The UI is intentionally close to the older HTML version to make migration safer
- Some pages still use DataTables/jQuery-style integrations while preserving the Vue app structure
