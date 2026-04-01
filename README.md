# Device Efficiency Frontend

Vue 3 frontend for the Device Efficiency platform.

This application is the operator-facing web interface for:

- dashboard monitoring
- single-device investigation
- report generation
- licence review
- documentation access
- administration and installation reference

It is designed to work with the Device Efficiency backend over HTTPS and WSS and to run fully inside a local network without requiring public internet access during normal operation.

## Stack

- Vue 3
- Vue Router
- Vite
- Limitless template assets
- DataTables
- ECharts
- SweetAlert

## Main Features

- Login page backed by backend JWT authentication
- Dashboard page with:
  - total devices
  - online devices
  - total groups
  - live group charts
  - grouped device table
- One-device statistics page with:
  - live WSS updates
  - CPU frequency chart
  - fixed session summary
  - crash correlation
  - app stats
  - crash history
  - command history
  - direct single-device report generation
- Report generator page for multi-device PDF export
- Licences page
- About page
- Administration page with technical and installation information
- Documentation menu item that opens the latest backend-served PDF
- Download APK menu item that downloads the latest backend-served APK
- Role-aware UI for `admin` and `user`

## Roles

The frontend reflects the backend permission model:

- `admin`
  - full visibility
  - can send commands to devices
- `user`
  - full visibility
  - cannot send commands

The backend remains the source of truth for authorization. The frontend hides command actions for read-only users, but protected actions are also enforced server-side.

## Project Setup

Install dependencies:

```bash
npm install
```

## Development

Run the Vite development server:

```bash
npm run dev
```

By default, the frontend runs on:

```text
http://localhost:5173
```

## Production Build

Build the production frontend:

```bash
npm run build
```

The output will be created in:

```text
dist/
```

In production, this build should be served by nginx. The Vite dev server should not be used as the production web server.

## Environment

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_DEV_PORT=5173
VITE_API_BASE_URL=https://127.0.0.1:3000/api
VITE_WS_BASE_URL=wss://127.0.0.1:3000/dashboard
```

### Environment variable notes

- `VITE_DEV_PORT`
  - controls the local Vite development port
  - used only in development
- `VITE_API_BASE_URL`
  - backend API base URL
- `VITE_WS_BASE_URL`
  - backend dashboard WebSocket base URL

For production, these values should point to the local hostname or IP used by operators and Android devices, for example:

```env
VITE_API_BASE_URL=https://freq.local/api
VITE_WS_BASE_URL=wss://freq.local/dashboard
```

## Authentication

The frontend logs in through:

- `POST /api/auth/login`

On successful login:

- a JWT is stored locally
- the current user object is stored locally
- protected routes become accessible

The frontend then uses:

- `Authorization: Bearer <token>`

for protected backend requests.

The frontend also connects to the dashboard WSS endpoint using that stored token.

## Live Updates

The frontend uses a shared dashboard WebSocket client for live updates.

Live behavior currently includes:

- device online/offline changes
- command updates
- command results
- device stats updates
- live frequency updates on the one-device page

This allows the dashboard and single-device views to stay current without repeated full-page refreshes.

## Main Pages

- `/` or `/login`
  - login page
- `/home`
  - dashboard
- `/about`
  - product overview
- `/administration`
  - technical overview and installation notes
- `/licences`
  - licence list
- `/device`
  - report generator
- `/one-device?id=<deviceId>`
  - one-device statistics page
- `/public-docs`
  - public frontend-side docs page

## Navigation Links Backed By Backend Downloads

The sidebar includes backend-served download/open actions:

- `Documentation`
  - opens the latest PDF from the backend `docs` folder in a new tab
- `Download APK`
  - downloads the latest APK from the backend `docs/apk` folder

These are not frontend-owned files. The frontend simply links to the backend download endpoints.

## Offline-First Notes

This frontend is intended for isolated or intermittently connected environments.

Important design points:

- vendor assets are served locally
- normal operation does not depend on public CDNs
- production deployment is expected on the same local network as the backend
- the frontend can be served locally by nginx together with the backend reverse-proxy setup

## Deployment Model

The recommended production model is:

- frontend and backend remain in separate git repositories
- both are deployed to the same Linux machine
- nginx serves the built frontend
- nginx proxies `/api`, `/dashboard`, `/downloads`, and `/health` to the backend

This keeps development separation while making production deployment straightforward.

## Related Backend Expectations

This frontend expects the backend to provide:

- JWT auth endpoints
- protected dashboard APIs
- dashboard WebSocket endpoint
- report generation
- public documentation download endpoint
- APK download endpoint

See the backend repo deployment guide for the full Linux installation flow.
