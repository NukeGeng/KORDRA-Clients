from pathlib import Path
root = Path(__file__).resolve().parents[1]
html = (root/'index.html').read_text()
css = (root/'styles.css').read_text()
js = (root/'app.js').read_text()
assert '<main id="main"' in html
assert '--bg:#fff' in css and 'background:#fff' in css
for name in ('overview','infrastructure','artifacts','releases','approvals','deployments','connections','audit','settings'):
    assert f"id:'{name}'" in js
for action in ('new-release','approve:','reject:','preview-deploy:','rollback:','export:'):
    assert action in js
assert 'fetch(' not in js and 'XMLHttpRequest' not in js
assert 'No backend connection' in html
print('PASS: nine screens, light background, preview workflows, no network client')
