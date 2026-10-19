# KORDRA Clients — Frontend session rules

Read README.md, WORKFLOW.md, contracts/product-reference.json and the active feature before editing. Identify the feature, owning business module, actor/tenant scope, approved API contract, paths and tests. This repo's engineering bootstrap is FEAT-CLIENTS-001; product feature ownership remains with canonical Product specs.

## Workspace and ownership

- Work only in this repository, mounted at `/Users/dangvyhao/Documents/KORDRA/clients`. Use a named `codex/frontend/<feature>` branch; initial submodule checkout may be detached.
- Own `web/`, `desktop/`, `packages/`, frontend docs/tests and this repository's CI. Keep the original folders as reservations until their features/technology are approved. Do not install speculative stacks or dependencies to fill the folders.
- Do not write Product source, `.gitmodules`, integration pins, `.amr-local/` checkpoints, parent Git metadata or parent documentation. Request Product contract changes through the maintainer/Product session; do not send messages to another session without direct human authorization.
- Do not edit the independent marketing Website repository, install WordPress, or access its services/databases unless a separate explicit task authorizes that repository. No Website migration is included here.
- Never run parent GOAL commands, inherit/copy Product checkpoints, spawn collaboration sub-agents or introduce a second AMR orchestrator. Two independent human-started sessions do not change AMR v4 role boundaries.

## Contracts and security

- Product is canonical for business rules, permissions, tenant isolation and API contracts. Record the Product commit/contract revision used; do not invent endpoints or assume proposals are accepted.
- The current Inventory API remains denied. Synthetic fixtures must be labelled mock. Do not weaken API authorization to make UI work, trust user-supplied tenant IDs, or embed role-name authorization in the client.
- Keep credentials, kubeconfig, private company data and real infrastructure details out of source, browser bundles, tests, PRs and logs. The frontend does not connect directly to PostgreSQL or obtain its passwords.
- Runtime/dependency/contract changes need the applicable human-approved feature/decision. This repository split approves no Vue/Tauri/authentication/storage technology.

## Tests, services and review

- During implementation run targeted frontend tests. At feature/PR boundaries run its required build/test/browser/security gates, adding actual UI CI when source is adopted. Current `repository-integrity` checks only the scaffold; never present it as browser/runtime validation.
- Respect Product and Website ports/services. Agree port ownership before launching a frontend dev server; do not start duplicate backend services or stop unrelated processes/containers.
- Luna Max (`gpt-6-luna/max`) implements approved features. Sol 6.1 High designs bounded changes and returns; Sol Medium/High debugs scoped difficult defects under Product AMR v4 policy. Verify exact model/effort from native evidence before claiming a profile was used; do not silently substitute.
- Codex Auto PR Review is the default independent reviewer when access/settings are configured. Default one round, maximum three per PR, round 1 full diff and subsequent rounds incremental from the last verified reviewed SHA. Track SHAs/run IDs/canonical findings privately, avoid duplicates and stop after round 3. Remaining blockers go to the maintainer; exhaustion is not approval and does not launch Sol.
- Architect/debugger sessions must not trigger or manage PR reviews. Luna/human review actions require evidence. No additional local AI review, new trigger controller or automatic merge. Native hard-cap enforcement remains unverified.
- Update the owning feature and test evidence in the same PR. Preserve explicit human design/merge approval. Do not claim tests, native reviews, deployments or checkpoint completion that were not observed.
