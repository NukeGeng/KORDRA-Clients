# KORDRA public website

The public KORDRA website lives in this directory inside the independent `NukeGeng/KORDRA-Clients` repository. It is not a separate Git repository, the operational Vue client, or a WordPress deployment. Its approved scope is [FEAT-CLIENTS-WEBSITE-001](../docs/features/website.md).

The approved Orbital Control prototype and reference images are preserved under `prototype/` and `design/references/`. The implementation is a native WordPress Block Theme in `theme/kordra/`, with local development files under `dev/`. Product truth and the visual system are recorded in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md). The theme self-hosts IBM Plex Sans and IBM Plex Mono under their SIL Open Font License notices.

## Local WordPress

Requirements: Docker Desktop running with Compose v2. PHP is provided by the official WordPress image. Node.js 22 or newer runs the native animation tests; no JavaScript package manager or package installation is required.

```sh
cd /Users/dangvyhao/Documents/KORDRA/clients
cp website/dev/.env.example website/dev/.env
```

Change the sample passwords in `website/dev/.env`, then run:

```sh
website/dev/setup-local.sh
```

The setup script installs WordPress locally, activates the KORDRA theme, sets the static Home page, creates the Features / Documentation / Releases pages and the Updates category. Open <http://127.0.0.1:8081>. The Compose project is named `kordra-website`; the database has no published host port and its data is kept in dedicated named volumes.

```sh
docker compose --env-file website/dev/.env --project-directory website/dev -f website/dev/compose.yaml ps
docker compose --env-file website/dev/.env --project-directory website/dev -f website/dev/compose.yaml logs -f wordpress db
docker compose --env-file website/dev/.env --project-directory website/dev -f website/dev/compose.yaml down
```

`down` stops only this Compose project. Add `-v` only when you intentionally want to delete the local WordPress and database volumes. Never point this configuration at `kordra.id.vn`, a Product service, or a non-local database.

For a local smoke check after WordPress setup, use `python3 website/dev/smoke-test.py`. It checks the local front page, pages, theme stylesheet and optimized banner over HTTP without logging in or changing content.

## Quality checks

```sh
python3 -m unittest discover -s tests -v
python3 tools/check_repository.py
python3 -m unittest discover -s website/tests -v
node --test website/tests/reveal.test.cjs
docker compose --env-file website/dev/.env.example --project-directory website/dev -f website/dev/compose.yaml config --quiet
website/dev/lint-php.sh
python3 website/dev/smoke-test.py
git diff --check
```

The theme is editable through the WordPress Site Editor. Do not install page builders or use the live WordPress admin as a development environment.
