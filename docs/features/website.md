---
id: FEAT-CLIENTS-WEBSITE-001
feature_id: FEAT-CLIENTS-WEBSITE-001
status: accepted
owner: clients-website
last_reviewed: 2026-10-20
---

# FEAT-CLIENTS-WEBSITE-001 — Public KORDRA website

## Ownership and scope

The owner assigned the public KORDRA website to the KORDRA-Clients repository at `website/`. The owning module is **Clients / Public Website**. This is a presentation and editorial responsibility, not a KORDRA Product business module. Product remains authoritative for product behavior, permissions, tenant boundaries and API contracts.

The website explains KORDRA's purpose, product direction, current development status, public documentation and published updates. It implements an approved Orbital Control / Engineering Editorial design as a native WordPress Block Theme. The scope covers Home, Features, Documentation, Blog / Updates and Releases / Download views.

Out of scope: operational Control Plane UI, Product API clients, authentication, tenant data, invented product capability, live telemetry, company infrastructure details, product backend changes and production WordPress deployment.

## Use cases, actors and authorization

- **Primary actor:** anonymous public visitor who wants to understand KORDRA, inspect its roadmap and status, read public documentation or updates, and determine whether a real release exists.
- **Editorial actor:** a WordPress editor who manages published pages and posts through WordPress's existing capabilities. This feature adds no custom roles, permission checks or login flow.
- **Tenant scope:** not applicable. Public pages contain no tenant-specific data and accept no tenant identifiers.
- **Visitor permission:** read published public content. Drafts and WordPress administration remain protected by WordPress core.
- **Product authorization:** none is performed by the theme. Product permissions remain server-owned; the site makes no API calls.

## Product truth and contract baseline

- Product checkout reviewed: `NukeGeng/KORDRA` commit `d73b66a335d012c435bcafc48c1f90bddf192513`.
- Clients' Product reference contract: `contracts/product-reference.json`, schemaVersion 1, Product revision `63a7951f48b4441e880defaf315c3755ff79842b`; it records `apiStatus: not-approved` and `inventoryAccess: denied`.
- Product documentation describes Stage 0 Foundation. A narrow local loopback API bootstrap and small domain increments exist; there is no complete operational Control Plane, production release or public download implied by this website.
- The public GitHub Releases page showed no releases when checked on 2026-10-20. The page must therefore show an honest in-development state and link to the real repository/release page without a download button.

Proposed Product features remain product direction. Copy must not present deployment, verification, recovery, integrations, customer adoption, performance, security certification or production readiness as shipped evidence unless the public Product source later verifies the claim.

## WordPress architecture

- Native WordPress Block Theme: `website/theme/kordra/`.
- Use `theme.json`, HTML block templates and template parts, PHP block patterns, WordPress core Navigation, Query Loop, Site Title and Post Title/Post Content blocks.
- Ordinary CSS; no frontend framework, paid page builder, Product API, or unnecessary plugin. JavaScript is omitted unless a tested WordPress-native interaction cannot meet the requirement.
- Templates cover the front page, slug-based Features / Documentation / Releases pages, generic pages, posts, archives and 404. Blog content uses native WordPress Posts. The theme remains editable in the Site Editor where practical.
- Local development uses a dedicated `kordra-website` Docker Compose project under `website/dev/`, local-only port `127.0.0.1:8081`, a dedicated database and named volumes. No production URL, secret or Product service is used.

## Source, design references and external dependencies

Primary paths:

- Governance and acceptance: `docs/features/website.md`, `website/README.md`.
- Product and design truth: `website/PRODUCT.md`, `website/DESIGN.md`.
- Approved prototype and original banner: `website/prototype/index.html`, `website/prototype/styles.css`, `website/prototype/assets/banner.png`.
- Approved visual references: `website/design/references/desktop.png`, `desktop-first-screen.png`, `mobile.png`, `mobile-first-screen.png`.
- Theme: `website/theme/kordra/`.
- Local development: `website/dev/`.
- Website checks: `website/tests/`.

The original banner must remain byte-identical to Product's approved asset, Git blob SHA `5def9f1dd5869e6a6a944d2b9c12458a83b2dfaf`. The ZIP concept is the approved visual direction; its legacy separate-repository instructions are superseded by the owner decision that `website/` belongs in KORDRA-Clients.

Runtime dependencies are WordPress core and MariaDB/MySQL only for the isolated local development environment. Impeccable is a development design skill installed project-locally at the Clients Git root; it is not a website runtime dependency. No third-party WordPress plugin or external API is required.

## Tests and acceptance criteria

Mapped checks:

- `website/tests/test_theme_integrity.py`: theme structure, metadata, template and pattern coverage, safe local Compose configuration and banner hash.
- Existing Clients scaffold tests and checker remain required in CI.
- PHP lint for every theme PHP file.
- Local WordPress runtime smoke test on the dedicated Compose project when Docker is available.
- Browser inspection at 1440px, 768px and 390px, with screenshots compared against the approved desktop/mobile references.
- WordPress Features / Documentation / Releases pages render editable core Page titles and body content, and a repeated local bootstrap preserves editorial changes.
- Keyboard navigation, visible focus, landmarks, contrast, reduced motion, responsive navigation and no horizontal overflow.

Acceptance requires the approved banner-led composition, the five-node sequence `ARTIFACT → APPROVE → DEPLOY → VERIFY → RECOVER`, a clearly marked conceptual topology diagram, honest Foundation / In Development status, functional public links, editable WordPress Page titles and body content that persist after local bootstrap reruns, removal of WordPress's two default starter entries on first install only, native WordPress blog/archive templates and an honest empty release state when no release exists. No production deployment is part of this feature.

## Known limitations and evidence state

**Source status: Implemented. CI PHP/runtime status: Verified. Local visual/browser status: Pending.** The archive, reference screenshots and banner are imported, and the WordPress Block Theme plus isolated Compose setup are implemented on the feature branch.

Evidence captured on 2026-10-20:

- `python3 -m unittest discover -s website/tests -v`: 9 tests passed.
- `docker compose --env-file website/dev/.env.example --project-directory website/dev -f website/dev/compose.yaml config --quiet`: passed.
- `git diff --check`: passed.
- GitHub Actions run `39368056950` for commit `bb00c5a9013fbbc10c9545e1d64ce1cb6ee6f41a`: `repository-integrity` and `website-quality` passed. The website job linted theme and helper PHP, rendered editable title/body changes for all three public pages, reran local bootstrap, verified those editorial changes remained visible over HTTP, and confirmed the two WordPress starter routes return 404.
- Docker CLI and Compose are installed, but the local Docker daemon socket is unavailable; host PHP CLI is absent. Local PHP lint, local WordPress smoke checks and 1440 / 768 / 390 browser screenshots have not been run. The CI runtime result does not replace browser viewport inspection.
- No production WordPress site, Product service, or Product source was modified.

These results establish static implementation, PHP syntax and an isolated CI WordPress runtime. They do not establish local browser rendering, responsive screenshots, full accessibility conformance, or production readiness. Add browser evidence after that inspection completes.
