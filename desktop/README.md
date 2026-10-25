---
id: FEAT-CLIENTS-DESKTOP-001
status: implemented-preview
owner: clients-desktop
last_reviewed: 2026-10-25
---

# KORDRA Desktop local control plane preview

This folder contains the Vue 3 + TypeScript implementation of the approved KORDRA Desktop prototype. It is a local synthetic-data preview in a Tauri 2 shell; it is not a connected Product client or a production operations tool.

Read the feature record at [`docs/features/desktop-control-plane.md`](../docs/features/desktop-control-plane.md) for ownership, Product boundaries, setup, verification and limitations.

## Run the web preview

Requires Node.js 22 (CI uses Node 22) and npm:

```sh
cd desktop
npm ci
npm run dev
```

Vite binds to `127.0.0.1:1420` and requires the port to be free. The app makes no Product API, cluster, registry or database connection.

## Run the native development shell

Install the Rust stable toolchain, Tauri 2 prerequisites for macOS and the npm dependencies, then run:

```sh
npm run tauri:dev
```

The shell has no custom Rust commands or Product domain logic. The current Tauri bundle is disabled; `tauri:build` can compile the app binary but does not create an installer, signed package or production release bundle.

## Validate

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:ui
npm run build
npm audit --audit-level=moderate
```

All records are synthetic fixtures in `src/fixtures/mockData.ts`. Approval, deployment progress, rollback, draft creation, export and reset interactions only change in-memory preview state.

The browser suite uses Chromium and covers all nine routes, primary local workflows, keyboard navigation and responsive widths. CI installs Chromium with `npx playwright install --with-deps chromium`.

Native Tauri launch/build was not available in the implementation environment: `npm run tauri -- info` reported that Rust/Cargo and Xcode.app are missing. Xcode Command Line Tools are installed. See the feature record for the full verification evidence and limits.
