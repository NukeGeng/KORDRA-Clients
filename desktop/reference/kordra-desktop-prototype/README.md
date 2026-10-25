# KORDRA Desktop Control Plane — White UI Prototype

A **runnable, dependency-free** functional design preview of the KORDRA desktop operator interface. It is **not** a shipped native desktop app, a Vue/Tauri scaffold, an operational Product client or a connected cluster viewer.

## Open locally

Open `index.html` in any modern browser. For local serving:

```bash
cd kordra-desktop-prototype
python3 -m http.server 4173 --bind 127.0.0.1
# http://127.0.0.1:4173
```

No installation, Node modules, API keys, network access, credentials, Docker or backend required. In a later approved frontend feature, this prototype can be ported into `/clients/desktop` using the accepted UI framework and Product HTTP contracts.

## Features you can try

- Nine navigable operational and management screens: Overview, Infrastructure, Artifacts, Releases, Approvals, Deployments, Connections, Audit log and Settings.
- Environment switching between synthetic Production, Staging and Development datasets.
- Resource-type tabs for workloads, nodes, services and storage (PVC), table filters, search, sort and row inspector.
- Inspect artifact digests, candidate releases, deployment step-by-step histories, and scoped audit examples.
- Create a **sample release draft**, approve/reject a **sample request**, create a **sample deployment run**, and record a **sample rollback request**. All changes are ephemeral in browser memory. They never invoke a server.
- Export current filtered example rows as CSV, reset sample data, choose compact table density, global navigation palette with `⌘K` / `Ctrl+K`, keyboard Escape, mobile navigation.

## Revision — contextual toolbars

The existing topbar breadcrumb is the only page heading. Every content screen begins with a task-oriented toolbar rather than a duplicated title and explanatory paragraph. Table screens combine environment selection, search, status filters, CSV export and feature actions in one action row, with clear wrapping at narrower widths. Overview and Settings offer only relevant actions. No live backend/provider operations are enabled.

## Design decisions

Based on Impeccable `v4.7.0` skill in KORDRA-Clients: **Operate** mode (familiar task UI), `craft-floor`, `layout`, `clarify`, `harden`, `adapt`. White content background `#FFFFFF`, pale neutral navigation, IBM-inspired editorial restraint without marketing effects; operational labels in standard system sans, monospace only for identifiers/digests; semantic status palette, no fake telemetry.

Primary user task: choose environment → inspect resources → review release/approval → inspect deployment/verification → audit. All sample values are intentionally fictional. Unknown is distinct from unhealthy, and local preview actions cannot be confused with Product authorization.

## Source / authority

- Product canonical repo: https://github.com/NukeGeng/KORDRA
- Frontend owner repo: https://github.com/NukeGeng/KORDRA-Clients
- Product contract reference in Clients still records API as unapproved and inventory as denied. This template does not consume it or alter source policy.
- This ZIP is a standalone handoff artifact. It has **not** been committed or merged into either repository.

## Quality check

`tests/smoke.py` runs no-server static assertions. Browser screenshots and desktop interaction smoke were checked separately for the generated artifact. No claim is made about actual Product integration or security testing of a future production application.
