# KORDRA Clients

Independent frontend repository mounted at `KORDRA/clients` as a Git submodule. The Product repository remains [NukeGeng/KORDRA](https://github.com/NukeGeng/KORDRA), with canonical business rules, API contracts and backend authorization.

## Current scope

This bootstrap preserves the existing reserved `web/`, `desktop/`, `packages/ui/` and `packages/api-client/` directories. There is no frontend application, package manager, Vue/Tauri adoption, login, browser build or live API integration yet. Those require an approved feature and relevant technology/contracts. Scaffold CI is not application test evidence. The separate marketing Website repository is not migrated here.

## Work independently

Open `/Users/dangvyhao/Documents/KORDRA/clients` as the frontend session's workspace. Read [AGENTS](AGENTS.md), [WORKFLOW](WORKFLOW.md) and the [bootstrap feature](docs/features/repository-bootstrap.md). Do not operate from the Product root or modify its checkpoints/services.

```sh
git fetch origin
git switch -c codex/frontend/<feature> origin/main
python3 -m unittest discover -s tests -v
python3 tools/check_repository.py
```

Replace `<feature>` with the approved feature name. On this Mac, the local remote uses `git@github-nukegeng:NukeGeng/KORDRA-Clients.git`; portable clones use `https://github.com/NukeGeng/KORDRA-Clients.git`.

Create scoped frontend PRs. Once the human maintainer merges a revision, Product can update its submodule pin in a separate integration PR. Never change Product's gitlink or run recursive parent submodule updates yourself.

## Contracts and review

[Product reference](contracts/product-reference.json) records the reviewed Product baseline. Inventory ingress at that baseline is denied; no positive frontend API/login is approved. Mock UI uses synthetic fixtures with explicit mock status. Keep backend permission decisions on the server and never bundle database credentials, tokens or company infrastructure data.

Follow AMR v4: Luna Max develops and tests; Sol has bounded design/debugging roles; Codex Auto PR Review is the default PR reviewer when configured. One review by default, maximum three rounds per PR; incremental follow-ups, canonical findings and no repeated unchanged-revision review. No independent local AI review or automatic Sol review. Human approval controls design and merge. Connector access and automatic Code Review must be verified separately for this repository; CI does not configure the provider.

Public repository availability is not a license decision or an OSS release-readiness claim; licensing remains with the owner.
