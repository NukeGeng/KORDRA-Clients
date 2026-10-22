# KORDRA Clients — Frontend session rules

Read README.md, WORKFLOW.md, contracts/product-reference.json and the active feature before editing. Identify the feature, owning module, actor/tenant scope, approved API contract, paths and tests. This repo's engineering bootstrap is FEAT-CLIENTS-001; Product feature ownership remains with canonical Product specs. Public website work follows [FEAT-CLIENTS-WEBSITE-001](docs/features/website.md).

## Workspace and ownership

- Work only in this repository, mounted at `/Users/dangvyhao/Documents/KORDRA/clients`. Use a named `codex/frontend/<feature>` branch; initial submodule checkout may be detached.
- Own `web/`, `desktop/`, `packages/`, `website/`, frontend docs/tests and this repository's CI. Keep `web/`, `desktop/` and `packages/` as reservations until their features/technology are approved. The owner-approved public website is implemented only in `website/` as a native WordPress Block Theme; it is not the operational Control Plane and must not invent Product API capabilities or authorization behavior.
- Do not write Product source, `.gitmodules`, integration pins, `.amr-local/` checkpoints, parent Git metadata or parent documentation. Request Product contract changes through the maintainer/Product session; do not send messages to another session without direct human authorization.
- Keep the local WordPress environment isolated under `website/dev/`, on localhost only, with its own Compose project and volumes. Never edit, deploy to, or access the live `kordra.id.vn` WordPress installation, its database, or production credentials as part of this feature.
- Never run parent GOAL commands, inherit/copy Product checkpoints, spawn collaboration sub-agents or introduce a second AMR orchestrator. Two independent human-started sessions do not change AMR v4 role boundaries.

## Contracts and security

- Product is canonical for business rules, permissions, tenant isolation and API contracts. Record the Product commit/contract revision used; do not invent endpoints or assume proposals are accepted.
- The current Inventory API remains denied. Synthetic fixtures must be labelled mock. Do not weaken API authorization to make UI work, trust user-supplied tenant IDs, or embed role-name authorization in the client.
- Keep credentials, kubeconfig, private company data and real infrastructure details out of source, browser bundles, tests, PRs and logs. The frontend does not connect directly to PostgreSQL or obtain its passwords.
- Runtime/dependency/contract changes need the applicable human-approved feature/decision. This repository split approves no Vue/Tauri/authentication/storage technology.

## Tests, services and review

- During implementation run targeted frontend tests. Website changes require website static checks, PHP syntax validation and a local WordPress smoke test when the Docker runtime is available. At feature/PR boundaries run its required build/test/browser/security gates, adding actual UI CI when source is adopted. Current `repository-integrity` checks only the scaffold; never present it as browser/runtime validation.
- Respect Product and Website ports/services. Agree port ownership before launching a frontend dev server; do not start duplicate backend services or stop unrelated processes/containers.
- Luna Max (`gpt-6-luna/max`) implements approved features. Sol 6.1 High designs bounded changes and returns; Sol Medium/High debugs scoped difficult defects under Product AMR v4 policy. Verify exact model/effort from native session metadata when available; do not require user screenshots or block unrelated implementation if metadata is unavailable. Report an unavailable profile as unverified and do not silently substitute another model or effort.
- Codex Auto PR Review is the default independent reviewer when access/settings are configured. Default one round, maximum three per PR, round 1 full diff and subsequent rounds incremental from the last verified reviewed SHA. Track SHAs/run IDs/canonical findings privately, avoid duplicates and stop after round 3. Remaining blockers go to the maintainer; exhaustion is not approval and does not launch Sol.
- Architect/debugger sessions must not trigger or manage PR reviews. Luna/human review actions require evidence. No additional local AI review, new trigger controller or automatic merge. Native hard-cap enforcement remains unverified.
- Update the owning feature and test evidence in the same PR. Preserve explicit human design/merge approval. Do not claim tests, native reviews, deployments or checkpoint completion that were not observed.
