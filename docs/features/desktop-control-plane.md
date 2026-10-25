---
id: FEAT-CLIENTS-DESKTOP-001
feature_id: FEAT-CLIENTS-DESKTOP-001
status: implemented-preview
owner: clients-desktop
last_reviewed: 2026-10-25
---

# FEAT-CLIENTS-DESKTOP-001 — Desktop Control Plane preview

## Ownership and scope

KORDRA Desktop is a Clients-owned operational interface preview in `desktop/`. It migrates the owner-supplied, approved prototype into reusable Vue components while retaining its white operational style, nine-screen information architecture, breadcrumb title, contextual toolbar and inspectors. The Website remains a separate public editorial product in `website/`.

The primary actor is a synthetic local demo operator. No tenant is authenticated or selected, and sample environment labels do not identify or access actual tenant infrastructure. All resource, artifact, release, deployment, connection and audit records are synthetic.

Included scope: Overview, Infrastructure (Workloads, Nodes, Services and Storage/PVC), Artifacts, Releases, Approvals, Deployments, Connections, Audit log and Settings; local filtering, sorting, CSV export, inspection, sample draft and approval flows, deployment progress, rollback preview, reset, compact density, keyboard shortcuts and responsive navigation.

Excluded scope: Product API integration, authentication, role or tenant authorization, direct Kubernetes/Helm/registry/database access, credential collection, production commands and deployment. No Product repository files, submodule pins or AMR checkpoints are changed.

## Product authority and boundary

- Product baseline and immutable contract reference: `NukeGeng/KORDRA` revision `63a7951f48b4441e880defaf315c3755ff79842b`, recorded in [`contracts/product-reference.json`](../../contracts/product-reference.json).
- The reference records `apiStatus: not-approved` and `inventoryAccess: denied`. Product remains canonical for contracts, permission policy, tenant isolation and business behavior. The preview defines no API endpoint or authorization behavior.
- Relevant Product references in that revision: `docs/contracts/permissions.md`, `docs/features/infrastructure-inventory/features/register-target.md`, `docs/decisions/0003-tenant-authorization.md` and `docs/decisions/0010-local-readonly-bootstrap.md`.
- Preview actions are clearly labelled simulations. They modify only Pinia state in the current tab and never send an operation to Product or infrastructure. Reset restores the in-memory fixtures; state is not persisted.

## Technology choice

The owner-provided feature brief explicitly authorizes this implementation stack for this feature: Vue 3 Composition API with `<script setup>`, strict TypeScript, Vite, Vue Router, Pinia, Tauri 2 and a minimal Rust shell. This records the feature scope and does not amend the repository-wide architecture decision or approve future authentication, storage or Product integration technology.

The Rust layer only starts the Tauri window. The frontend uses no Tauri plugin or command API. Tauri capabilities are limited to its default window runtime. Native packaging and signing are disabled for this preview.

## Source map

- Shell and navigation: `desktop/src/App.vue`, `desktop/src/router/`, `desktop/src/components/layout/`.
- Shared operational UI: `desktop/src/components/toolbar/`, `tables/`, `inspector/`, `feedback/` and `Icon.vue`.
- Screen features: `desktop/src/features/`.
- Clearly synthetic records and state transitions: `desktop/src/fixtures/mockData.ts`, `desktop/src/stores/demo.ts`.
- Design tokens and responsive implementation: `desktop/src/styles/app.css`, migrated from `desktop/reference/kordra-desktop-prototype/styles.css`.
- Native shell: `desktop/src-tauri/`. Its app icon is generated from the repository's existing KORDRA logo at `website/theme/kordra/assets/images/logo-no-content.png`.
- Product API adapter: intentionally absent. A future adapter requires an accepted Product contract and authorization decision.

## Setup and verification

Install Node.js 22 and npm, then run in `desktop/`:

```sh
npm ci
npm run dev
npm run typecheck
npm test
npx playwright install chromium
npm run test:ui
npm run build
npm audit --audit-level=moderate
```

Vite uses `127.0.0.1:1420` with `strictPort`; confirm it is free before starting another local server. To open the Tauri development shell, install the Rust stable toolchain and current macOS Tauri prerequisites, then run `npm run tauri:dev`. If `xcode-select` points at Command Line Tools while Xcode is installed elsewhere, set `DEVELOPER_DIR` to that Xcode application's `Contents/Developer` directory for the command. The browser-only app does not require Rust.

Focused tests in `desktop/tests/demo.store.test.ts` verify fixture isolation, filtering and sorting, draft creation bounds, approval eligibility, simulated deployment progression, rollback audit behavior and CSV escaping. `desktop/tests/app.shell.test.ts` covers nine-screen navigation, the single breadcrumb title, environment switching and the keyboard palette. `desktop/tests/browser/desktop.spec.ts` exercises the nine routes, environment/filter/inspector interactions, simulated release-to-rollback flows, CSV download, keyboard navigation and responsive layout at 1440, 1280, 1024 and 390 CSS pixels. The `desktop-quality` CI job runs typecheck, unit tests, Chromium browser tests, build and npm audit. These checks do not claim native runtime or Product integration validation.

## Verification evidence (2026-10-25)

- Node 22.23.4: `npm run typecheck` passed; `npm test` passed (2 files, 8 tests); `npm run test:ui` passed (4 browser tests); `npm run build` passed; `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- The browser suite ran in local Chrome 156. A manual axe-core 4.14.0 scan reported no violations on the nine screens, inspector, release-draft dialog and closed/open mobile navigation. These manual accessibility scans are not a CI gate.
- Clients repository tests passed (6 tests), `python3 tools/check_repository.py` reported 0 errors, and `git diff --check` passed. The checker explicitly covers repository links and the Product contract only; it is not application or browser validation.
- Initial `npm run tauri -- info` missed Xcode because `xcode-select` pointed to Command Line Tools. With `DEVELOPER_DIR=/Users/dangvyhao/Downloads/Xcode.app/Contents/Developer`, it detected Xcode 16.4; `xcodebuild -checkFirstLaunchStatus` and `xcrun --show-sdk-path` passed. Rustup installed the stable `aarch64-apple-darwin` toolchain, providing rustc/Cargo 1.99.1.
- `npm run tauri -- build --no-bundle` passed with that `DEVELOPER_DIR` and Rust on `PATH`, after adding the missing app icon; it built `desktop/src-tauri/target/release/kordra-desktop`. The binary started and remained running as a macOS process. Direct window inspection was unavailable: macOS denied Accessibility access to `osascript`, and the terminal screenshot showed only the desktop wallpaper. The browser preview rendered at `http://127.0.0.1:1420/#/overview`; this does not establish visual parity in the native window.

## Limitations and acceptance status

The preview is ready for human review as a prototype milestone. It makes no claim of production readiness, live telemetry, valid infrastructure connection, real approval or execution. Native compilation and process launch are verified on this Mac; visual inspection of the native window remains unverified. Packaging, signing, persistence, localization and live backend integration remain out of scope.
