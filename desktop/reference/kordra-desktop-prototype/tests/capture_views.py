from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text();css=(root/'styles.css').read_text();js=(root/'app.js').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 page.set_content(html);page.add_style_tag(content=css);page.add_script_tag(content=js)
 page.screenshot(path=str(root/'preview-overview.png'),full_page=True)
 page.locator('.nav-link[data-page="infrastructure"]').click()
 page.screenshot(path=str(root/'preview-infrastructure.png'),full_page=True)
 page.locator('tr[data-detail="resource:res-02"]').click()
 page.screenshot(path=str(root/'preview-inspector.png'),full_page=False)
 page.keyboard.press('Escape')
 page.locator('.nav-link[data-page="releases"]').click()
 page.screenshot(path=str(root/'preview-releases.png'),full_page=False)
 page.locator('.nav-link[data-page="deployments"]').click()
 page.screenshot(path=str(root/'preview-deployments.png'),full_page=False)
 # Verify environment switch and CSV export with download event
 page.locator('#environment-select').select_option('Staging')
 assert page.locator('tbody tr').count()==1
 with page.expect_download() as d:
  page.locator('[data-action="export:deployments"]').click()
 assert d.value.suggested_filename=='kordra-preview-deployments-staging.csv'
 # Check deployment preview and rollback are explicitly synthetic
 page.locator('.nav-link[data-page="releases"]').click()
 page.locator('#environment-select').select_option('Production')
 page.locator('tr[data-detail="release:REL-1041"]').click()
 page.locator('[data-action="preview-deploy:REL-1041"]').click()
 page.locator('[data-action="confirm-dialog"]').click()
 assert page.locator('.inspector .status.running').count()>0
 page.keyboard.press('Escape')
 page.locator('tr[data-detail="deployment:DEP-801"]').click()
 page.locator('[data-action="rollback:DEP-801"]').click()
 assert 'Rollback is a new, separately authorized operation' in page.locator('.dialog-box').inner_text()
 page.locator('[data-action="confirm-dialog"]').click()
 assert page.locator('.toast').count()>0
 print('PASS: environment switch, filtered CSV export, deployment preview, rollback request')
 browser.close()
