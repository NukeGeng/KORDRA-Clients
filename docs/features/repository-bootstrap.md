# FEAT-CLIENTS-001 — Independent Clients repository bootstrap

Owner: engineering-maintainers. Actor: repository developer. Scope: repository setup; no tenant data or product operation. Authority: owner's explicit request to extract `clients/` and mount it back as a submodule. Product owns the canonical narrow ADR-0012 and integration pin.

## Implemented scope

Preserve clients-only history and the four existing reserved directories. Add standalone instructions, a versioned Product reference, stdlib scaffold validation/tests and GitHub CI. Each repository has its own branches, PRs and checks. This bootstrap feature does not include Website implementation, runtime source, stack dependency, IAM implementation, positive API access or production capability; the later, separately approved website scope is FEAT-CLIENTS-WEBSITE-001.

## Contracts and acceptance

- `contracts/product-reference.json` schemaVersion 1 identifies the Product repository, immutable revision and contract paths. It records no approved frontend API and denied inventory ingress. Changing public behavior requires the applicable Product contract decision before updating this reference.
- Standalone clone validates without a parent checkout. Links to Product use explicit remote references; no local path escapes into the parent.
- Required reservations and repository instructions exist. Invalid/missing reference fields, missing scaffold paths and broken/escaping local links fail validation.
- The repository-integrity CI job validates this bootstrap. A separate website-quality job now runs website static checks, PHP lint and isolated WordPress HTTP smoke checks. Browser viewport and accessibility inspection remain website-feature gates; the scaffold checker does not substitute for them.
- Clients remote main is pinned by a separate Product integration PR after human merge approval. Initial publication is bootstrap setup, not approval of a later feature.

## Source and test mapping

Sources: `tools/check_repository.py`, `contracts/product-reference.json`, `.github/workflows/ci.yml`, repository instructions and reserved READMEs. Tests: `tests/test_repository.py`. Existing folder reservations remain proposed. Native Code Review and branch protection are configured/verified separately from local tests; their actual setup state is reported by the setup session.

## Failure, recovery and boundaries

Reject malformed contract references and local-link escapes. Do not repair integration by changing backend permission behavior. Preserve private credentials and dirty work; no destructive cleanup or shared-process termination. Use a focused PR to fix bootstrap defects. Tenant/duplicate-message/crash/runtime cases are not applicable to this static repository operation and remain required when a feature introduces those behaviors.
