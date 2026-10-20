# Clients change workflow

1. Read the owning Product feature and accepted contracts at the recorded revision when a client consumes Product behavior. Product and Clients have separate PRs; proposals and UI mocks do not authorize backend behavior.
2. Identify approved scope, affected client packages, actor/tenant cases, API compatibility and actual tests in a Clients feature document. Public website scope is recorded in `docs/features/website.md` and does not consume Product APIs.
3. Create a named `codex/frontend/<feature>` branch. Implement inside this repository only. The website is a WordPress Block Theme under `website/theme/kordra/`; its isolated development services live under `website/dev/`. Never edit the Product parent, Product Gitlink, or live WordPress. CI has separate repository-integrity and website-quality jobs; extend the feature's applicable gates as new source is adopted.
4. Run targeted tests during development and the feature's complete deterministic gates at its PR boundary. Avoid repeated unchanged suites.
5. Commit explicit frontend paths, push and open a Clients PR. Include Product contract revision, test evidence, mock limitations and public-contract changes.
6. Let configured Codex Auto PR Review review it. Keep BIR within three rounds, track exact reviewed SHAs and unresolved canonical findings; do not duplicate a review on unchanged source. No routine Sol review or independent local AI review.
7. Human maintainer authorizes merge. A later Product integration PR pins the accepted, remotely available Clients commit and verifies compatibility. Clients cannot update its parent's pin.

## Website implementation gates

```sh
python3 -m unittest discover -s website/tests -v
docker compose --env-file website/dev/.env.example --project-directory website/dev -f website/dev/compose.yaml config --quiet
website/dev/lint-php.sh
website/dev/setup-local.sh
python3 website/dev/smoke-test.py
```

The local runtime requires Docker Desktop and a developer-created `website/dev/.env` with non-placeholder local-only passwords. `setup-local.sh` starts only the dedicated `kordra-website` Compose project. `lint-php.sh` uses the WordPress PHP image without starting site services. GitHub CI runs the PHP lint and isolated WordPress HTTP smoke checks. Browser viewport screenshots require inspection of the running local WordPress instance.

## Bootstrap validation

```sh
python3 -m unittest discover -s tests -v
python3 tools/check_repository.py
git diff --check
```

Use repository-local private evidence under ignored `.amr-local/` if needed. Do not share Product checkpoints or operate Product/Website services. No runtime server is started by this bootstrap.
