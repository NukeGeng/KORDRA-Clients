from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess, time, json, os
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python3','-m','http.server','4173','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(.8)
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'index.html').read_text(),wait_until='domcontentloaded')
  page.add_style_tag(content=(root/'styles.css').read_text())
  page.add_script_tag(content=(root/'app.js').read_text())
  page.screenshot(path=str(root/'preview-overview.png'),full_page=True)
  assert page.locator('#breadcrumb').inner_text()=='Overview'
  assert page.locator('.nav-link').count()==9
  assert page.locator('.page-heading').count()==0
  assert page.locator('.context-toolbar').count()==1
  results.append('overview has a contextual toolbar and no duplicate page heading')
  page.locator('.nav-link[data-page="infrastructure"]').click()
  assert page.locator('#breadcrumb').inner_text()=='Infrastructure'
  page.locator('button[data-tab="nodes"]').click()
  assert page.get_by_text('worker-east-01').count()>0
  page.locator('#table-search').fill('worker-east-02')
  assert page.locator('tbody tr').count()==1
  page.locator('tbody tr').click()
  assert page.locator('#inspector-name').inner_text()=='worker-east-02'
  page.keyboard.press('Escape')
  results.append('infrastructure tabs, search and inspector work')
  page.locator('.nav-link[data-page="approvals"]').click()
  page.locator('tr[data-detail="release:REL-1042"]').click()
  page.locator('[data-action="approve:REL-1042"]').click()
  assert page.locator('#dialog-title').inner_text()=='Approve sample release?'
  page.locator('[data-action="confirm-dialog"]').click()
  assert page.locator('.inspector .status.approved').count()>0
  page.keyboard.press('Escape')
  results.append('approval modal updates demo queue')
  page.locator('.nav-link[data-page="overview"]').click()
  page.locator('[data-action="new-release"]').click()
  page.locator('#release-name').fill('Test synthetic release')
  page.locator('[data-action="confirm-dialog"]').click()
  assert page.locator('#inspector-name').inner_text()=='Test synthetic release'
  results.append('release draft can be created')
  page.keyboard.press('Escape')
  page.keyboard.press('Control+k')
  assert page.locator('#command-input').is_visible()
  page.locator('#command-input').fill('set')
  assert page.locator('.command-result').count()==1
  page.keyboard.press('Escape')
  results.append('global command palette filters and dismisses')
  page.locator('.nav-link[data-page="settings"]').click()
  page.locator('[data-action="toggle-density"]').click()
  assert page.locator('.app-shell.compact').count()==1
  results.append('density option works')
  # Capture clean first-visit responsive states in separate pages.
  medium=browser.new_page(viewport={'width':1024,'height':768},device_scale_factor=1)
  medium.set_content((root/'index.html').read_text(),wait_until='domcontentloaded')
  medium.add_style_tag(content=(root/'styles.css').read_text())
  medium.add_script_tag(content=(root/'app.js').read_text())
  medium.wait_for_timeout(380)
  medium.screenshot(path=str(root/'preview-1024.png'),full_page=True)
  mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
  mobile.set_content((root/'index.html').read_text(),wait_until='domcontentloaded')
  mobile.add_style_tag(content=(root/'styles.css').read_text())
  mobile.add_script_tag(content=(root/'app.js').read_text())
  mobile.wait_for_timeout(380)
  mobile.screenshot(path=str(root/'preview-mobile.png'),full_page=True)
  overflow=mobile.evaluate('document.documentElement.scrollWidth > window.innerWidth')
  assert not overflow, 'mobile overflow'
  mobile.locator('#menu-toggle').click()
  assert mobile.locator('#sidebar.open').count()==1
  mobile.locator('.sidebar .nav-link[data-page="artifacts"]').click()
  assert mobile.locator('#breadcrumb').inner_text()=='Artifacts'
  results.append('responsive mobile drawer & navigation work')
  assert not errors, errors
  results.append('no page JavaScript errors')
  print(json.dumps({'results':results,'errors':errors,'screenshots':['preview-overview.png','preview-1024.png','preview-mobile.png']},indent=2))
  browser.close()
finally:
 server.terminate();server.wait(timeout=5)
