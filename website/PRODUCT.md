# KORDRA public website — Product context

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Native WordPress Block Theme using PHP registration/pattern files, block templates and CSS. No build framework or JavaScript package manager is part of the website. Local WordPress and MariaDB run in an isolated Docker Compose project under `website/dev/`. This stack and scope were explicitly assigned in the owner-approved website mission.

## Product identity

- Product: KORDRA, a release and deployment control plane in development.
- Tagline: **One Control Plane. Any Infrastructure.** This is product intent, not a claim of universal provider support.
- Audience: engineers, maintainers and teams evaluating a release/deployment control plane.
- Visitor job: understand the product proposition, inspect current development status and roadmap, read public documentation and updates, and check for real releases.
- Desired outcome: visitors understand that KORDRA aims to govern the handoff from immutable artifact through approval and deployment toward verification and recovery, while seeing clearly what is and is not shipped.

## Product status and evidence

KORDRA is at **Foundation / In Development**. Product documentation and source are published at <https://github.com/NukeGeng/KORDRA>. Current source supports only narrowly scoped foundation increments and a local loopback bootstrap; it does not establish a complete Control Plane, production readiness, or the proposed end-to-end release workflow as shipped.

Product checkout reviewed for this website: `d73b66a335d012c435bcafc48c1f90bddf192513`. The Clients Product reference is `contracts/product-reference.json` (schemaVersion 1, revision `63a7951f48b4441e880defaf315c3755ff79842b`), which records Product API access as not approved and inventory access as denied. The site must not consume Product APIs or imply otherwise.

The public Product Releases page showed no published releases when checked on 2026-10-20: <https://github.com/NukeGeng/KORDRA/releases>. Until a real release exists, show an in-development state and a link to GitHub; render no download control.

## Website surfaces

- Home: approved Orbital Control composition and honest product direction/status.
- Features: workflow explanations that label proposed capabilities as direction.
- Documentation: links to public Product documentation hosted on GitHub.
- Blog / Updates: native WordPress posts with Read-mode archive and article templates.
- Releases / Download: real release links only; honest empty state otherwise.

The public site is informational and editorial. It has no Product login, tenant scope, API client, live dashboard, telemetry or user-specific content. WordPress editorial access remains governed by WordPress core.

## Durable constraints

- Preserve `prototype/assets/banner.png` unchanged; its Git blob SHA is `5def9f1dd5869e6a6a944d2b9c12458a83b2dfaf`.
- Keep the approved monochrome Orbital Control / Engineering Editorial design in [DESIGN.md](DESIGN.md) and the supplied prototype. Do not create a new concept.
- Do not invent customer claims, metrics, testimonials, release dates, security certifications, production readiness, infrastructure telemetry or downloads.
- Do not publish private Product, company or LAB-01 details.
- Do not modify the Product parent repository, its checkpoints, services, API contracts or submodule pin.
- Never modify or deploy to the live `kordra.id.vn` WordPress installation as part of this feature.
