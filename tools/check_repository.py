#!/usr/bin/env python3
"""Validate the standalone Clients scaffold; no application build is claimed."""
import json
import os
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ('README.md', 'AGENTS.md', 'WORKFLOW.md', 'web/README.md',
            'desktop/README.md', 'packages/ui/README.md', 'packages/api-client/README.md',
            'docs/features/repository-bootstrap.md', 'contracts/product-reference.json')
EXCLUDED = {'.git', '.amr-local', '.temp', 'node_modules', 'dist', '__pycache__'}


def check(root):
    root = root.resolve()
    errors = [f'missing required file: {name}' for name in REQUIRED if not (root / name).is_file()]
    reference = root / 'contracts/product-reference.json'
    try:
        data = json.loads(reference.read_text('utf-8'))
        if (type(data.get('schemaVersion')) is not int or data['schemaVersion'] != 1
                or data.get('repository') != 'https://github.com/NukeGeng/KORDRA'
                or not isinstance(data.get('revision'), str)
                or not re.fullmatch(r'[0-9a-f]{40}', data['revision'])
                or data.get('apiStatus') != 'not-approved' or data.get('inventoryAccess') != 'denied'):
            errors.append('invalid Product contract reference or unapproved API adoption')
        paths = data.get('contractPaths')
        if not isinstance(paths, list) or not paths or any(
                not isinstance(path, str) or not path.startswith('docs/')
                or '..' in Path(path).parts or '\\' in path for path in paths):
            errors.append('contract paths must be nonempty Product docs-relative paths')
    except (OSError, ValueError, AttributeError):
        errors.append('missing or malformed Product contract reference')
    for parent, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d not in EXCLUDED and not (Path(parent) / d).is_symlink()]
        for name in names:
            if not name.endswith('.md'):
                continue
            path = Path(parent) / name
            if path.is_symlink():
                errors.append(f'markdown symlink is not supported: {path.relative_to(root)}')
                continue
            text = re.sub(r'```[\s\S]*?```', '', path.read_text('utf-8'))
            text = re.sub(r'`[^`\n]*`', '', text)
            for target in re.findall(r'(?<!!)\[[^]]*\]\(([^)]+)\)', text):
                target = target.split('#', 1)[0].split('?', 1)[0]
                if not target or '://' in target or target.startswith('mailto:'):
                    continue
                local = (path.parent / target).resolve()
                if not local.is_relative_to(root):
                    errors.append(f'local link escapes Clients: {path.relative_to(root)} -> {target}')
                elif not local.exists():
                    errors.append(f'broken local link: {path.relative_to(root)} -> {target}')
    return errors


def main():
    errors = check(ROOT)
    for error in errors:
        print('ERROR:', error)
    print(f'Clients scaffold links and contract: {len(errors)} errors; this checker does not run application or browser tests')
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(main())
