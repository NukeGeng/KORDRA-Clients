# WordPress Block Theme implementation handoff

This site is a public information website in `NukeGeng/KORDRA-Clients/website/`. It is not a separate repository, the Vue-based Product client, or a live WordPress deployment.

## Boundaries

- Use the native WordPress Block Theme in `theme/kordra/`: `theme.json`, HTML templates/template parts, PHP block patterns and ordinary CSS.
- Keep page content editable in WordPress and use core Navigation, Query Loop, Site Title, Post Title and Post Content blocks where practical.
- Product behavior, API contracts, permissions and tenant isolation remain owned by Product. The theme makes no API calls and displays no tenant or live telemetry data.
- The original banner is `prototype/assets/banner.png`; its required Git blob SHA is `5def9f1dd5869e6a6a944d2b9c12458a83b2dfaf`. The theme copy must match.

## Template coverage

- `front-page.html`: approved Orbital Control home page.
- `page-features.html`, `page-documentation.html`, `page-releases.html`: slug-based public pages.
- `page.html`: other WordPress pages.
- `index.html`, `archive.html`, `single.html`: native Blog / Updates content.
- `404.html`: branded recovery navigation.
- `parts/header.html`, `parts/footer.html`: shared site chrome.

Do not add fake posts or releases. The Releases page links to actual published releases only and otherwise explains that KORDRA is in development.

## Local environment

`website/dev/compose.yaml` defines a dedicated `kordra-website` project, isolated WordPress and database volumes, and loopback-only web exposure on port 8081. `.env` is local-only and ignored by Git. Do not stop unrelated containers or target the live `kordra.id.vn` WordPress service.

See [website README](../README.md) for start/stop/log/smoke commands and [feature acceptance](../../docs/features/website.md) for evidence requirements.
