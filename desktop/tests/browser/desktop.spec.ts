import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/overview')
  await expect(page.locator('.metrics')).toBeVisible()
})

test('all nine screens keep the breadcrumb as the only page title', async ({ page }) => {
  const screens = ['Overview', 'Infrastructure', 'Artifacts', 'Releases', 'Approvals', 'Deployments', 'Connections', 'Audit log', 'Settings']
  for (const screen of screens) {
    await page.getByRole('link', { name: new RegExp(screen) }).click()
    await expect(page.locator('.breadcrumb-current')).toHaveText(screen)
    await expect(page.locator('.context-toolbar')).toBeVisible()
  }
  await expect(page.locator('.main h1')).toHaveCount(0)
})

test('environment switching, search, status filters and the inspector work together', async ({ page }) => {
  await page.getByRole('link', { name: 'Infrastructure' }).click()
  await page.getByRole('searchbox', { name: 'Search resources' }).fill('checkout')
  await page.getByRole('combobox', { name: 'Filter records by status' }).selectOption('Degraded')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: /Inspect checkout-service/ }).click()
  await expect(page.getByRole('dialog', { name: 'checkout-service' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.getByRole('combobox', { name: 'Filter records by status' }).selectOption('All')
  await page.getByRole('searchbox', { name: 'Search resources' }).fill('')
  await page.getByRole('combobox', { name: 'Active environment' }).selectOption('Development')
  await expect(page.locator('tbody tr')).toHaveCount(2)
})

test('release, approval, deployment, rollback and CSV workflows remain local simulations', async ({ page }) => {
  await page.getByRole('link', { name: 'Releases' }).click()
  await page.getByRole('button', { name: 'New release' }).click()
  await page.locator('#release-name').fill('Browser test release')
  await page.locator('#release-artifact').selectOption('art-01')
  await page.locator('.dialog-box').getByRole('button', { name: 'Create demo draft' }).click()
  await expect(page.getByRole('dialog', { name: 'Browser test release' })).toBeVisible()
  await page.locator('.inspector-footer').getByRole('button', { name: 'Close details' }).click()

  await page.getByRole('link', { name: 'Approvals' }).click()
  const pendingRelease = page.locator('tbody tr').filter({ hasText: 'REL-1042' })
  await pendingRelease.getByRole('button', { name: /Inspect/ }).click()
  await page.getByRole('button', { name: 'Approve preview' }).click()
  await page.locator('.dialog-box').getByRole('button', { name: 'Approve in preview' }).click()
  await page.getByRole('button', { name: 'Preview deploy' }).click()
  await page.locator('.dialog-box').getByRole('button', { name: 'Create sample run' }).click()
  await expect(page.locator('.inspector')).toBeVisible()

  for (let step = 0; step < 3; step++) {
    await page.getByRole('button', { name: 'Advance sample progress' }).click()
  }
  await page.getByRole('button', { name: 'Preview rollback' }).click()
  await page.locator('.dialog-box').getByRole('button', { name: 'Record sample request' }).click()
  await page.locator('.inspector-footer').getByRole('button', { name: 'Close details' }).click()

  await page.getByRole('link', { name: 'Audit log' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  expect((await downloadPromise).suggestedFilename()).toMatch(/\.csv$/)

  await page.getByRole('link', { name: 'Infrastructure' }).click()
  await page.getByRole('combobox', { name: 'Active environment' }).selectOption('Staging')
  await page.getByRole('link', { name: 'Approvals' }).click()
  await page.locator('tbody tr').filter({ hasText: 'REL-1039' }).getByRole('button', { name: /Inspect/ }).click()
  await page.getByRole('button', { name: 'Reject preview' }).click()
  await page.locator('.dialog-box').getByRole('button', { name: 'Reject in preview' }).click()
  await expect(page.locator('.inspector')).toContainText('Rejected')
  await page.locator('.inspector-footer').getByRole('button', { name: 'Close details' }).click()

  await page.getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('switch', { name: 'Compact data tables' }).click()
  await expect(page.locator('.app-shell')).toHaveClass(/compact/)
  await page.getByRole('button', { name: 'Reset preview' }).click()
  await page.locator('.dialog-box').getByRole('button', { name: 'Reset preview' }).click()
  await page.getByRole('link', { name: 'Approvals' }).click()
  await expect(page.locator('tbody tr').filter({ hasText: 'REL-1039' })).toContainText('Pending')
})

test('keyboard shortcuts, narrow navigation and responsive widths are usable', async ({ page }) => {
  await page.keyboard.press('Meta+k')
  await expect(page.getByRole('dialog', { name: 'Search screens' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Search screens' })).toHaveCount(0)

  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Search screens' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Search screens' })).toHaveCount(0)

  for (const width of [1440, 1280, 1024, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(width)
  }

  await page.getByRole('button', { name: 'Open navigation' }).click()
  const navigation = page.getByRole('dialog', { name: 'Primary navigation' })
  await expect(navigation).toBeVisible()
  await expect(page.locator('.sidebar .nav-link').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await navigation.getByRole('link', { name: 'Infrastructure' }).click()
  await expect(page.locator('.breadcrumb-current')).toHaveText('Infrastructure')
})
