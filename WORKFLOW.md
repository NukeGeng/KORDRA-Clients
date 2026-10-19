# Clients change workflow

1. Read the owning Product feature and accepted contracts at the recorded revision. Product and Clients have separate PRs; proposals and UI mocks do not authorize backend behavior.
2. Identify approved scope, affected client packages, actor/tenant cases, API compatibility and actual tests in a Clients feature document.
3. Create a named `codex/frontend/<feature>` branch. Implement inside this repository only. Add frontend build/test CI when application source is introduced; the bootstrap's scaffold checker is insufficient for application acceptance.
4. Run targeted tests during development and the feature's complete deterministic gates at its PR boundary. Avoid repeated unchanged suites.
5. Commit explicit frontend paths, push and open a Clients PR. Include Product contract revision, test evidence, mock limitations and public-contract changes.
6. Let configured Codex Auto PR Review review it. Keep BIR within three rounds, track exact reviewed SHAs and unresolved canonical findings; do not duplicate a review on unchanged source. No routine Sol review or independent local AI review.
7. Human maintainer authorizes merge. A later Product integration PR pins the accepted, remotely available Clients commit and verifies compatibility. Clients cannot update its parent's pin.

For bootstrap validation only:

```sh
python3 -m unittest discover -s tests -v
python3 tools/check_repository.py
git diff --check
```

Use repository-local private evidence under ignored `.amr-local/` if needed. Do not share Product checkpoints or operate Product/Website services. No runtime server is started by this bootstrap.
