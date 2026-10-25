import { afterEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import App from '../src/App.vue'
import OverviewView from '../src/features/overview/OverviewView.vue'
import InfrastructureView from '../src/features/infrastructure/InfrastructureView.vue'
import ArtifactsView from '../src/features/artifacts/ArtifactsView.vue'
import ReleasesView from '../src/features/releases/ReleasesView.vue'
import ApprovalsView from '../src/features/approvals/ApprovalsView.vue'
import DeploymentsView from '../src/features/deployments/DeploymentsView.vue'
import ConnectionsView from '../src/features/connections/ConnectionsView.vue'
import AuditView from '../src/features/audit/AuditView.vue'
import SettingsView from '../src/features/settings/SettingsView.vue'
import { useDemoStore } from '../src/stores/demo'

const routes: RouteRecordRaw[] = [
  { path: '/overview', component: OverviewView, meta: { title: 'Overview', group: 'Operations' } },
  { path: '/infrastructure', component: InfrastructureView, meta: { title: 'Infrastructure', group: 'Operations' } },
  { path: '/artifacts', component: ArtifactsView, meta: { title: 'Artifacts', group: 'Operations' } },
  { path: '/releases', component: ReleasesView, meta: { title: 'Releases', group: 'Operations' } },
  { path: '/approvals', component: ApprovalsView, meta: { title: 'Approvals', group: 'Operations' } },
  { path: '/deployments', component: DeploymentsView, meta: { title: 'Deployments', group: 'Operations' } },
  { path: '/connections', component: ConnectionsView, meta: { title: 'Connections', group: 'Management' } },
  { path: '/audit', component: AuditView, meta: { title: 'Audit log', group: 'Management' } },
  { path: '/settings', component: SettingsView, meta: { title: 'Settings', group: 'Management' } },
]

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.style.overflow = ''
})

describe('Desktop application shell', () => {
  it('navigates among all nine screens without repeating the breadcrumb title', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/overview')
    await router.isReady()
    wrapper = mount(App, { attachTo: document.body, global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(wrapper.findAll('.nav-link')).toHaveLength(9)
    expect(wrapper.find('.breadcrumb-current').text()).toBe('Overview')
    expect(wrapper.findAll('.main h1')).toHaveLength(0)

    const infrastructureLink = wrapper.findAll('.nav-link').find((link) => link.text().includes('Infrastructure'))
    await infrastructureLink?.trigger('click')
    await flushPromises()
    expect(wrapper.find('.breadcrumb-current').text()).toBe('Infrastructure')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)

    const environment = wrapper.get('select[aria-label="Active environment"]')
    await environment.setValue('Development')
    expect(useDemoStore().environment).toBe('Development')
  })

  it('opens the screen palette with Ctrl+K and closes it with Escape', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/overview')
    await router.isReady()
    wrapper = mount(App, { global: { plugins: [pinia, router] } })
    await flushPromises()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[aria-label="Matching screens"]').exists()).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[aria-label="Matching screens"]').exists()).toBe(false)
  })

  it('opens the narrow-window navigation as a labelled dialog and restores focus when closed', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/overview')
    await router.isReady()
    wrapper = mount(App, { attachTo: document.body, global: { plugins: [pinia, router] } })
    await flushPromises()

    const menu = wrapper.get('#menu-toggle')
    await menu.trigger('click')
    await flushPromises()
    const navigation = wrapper.get('#primary-navigation')
    expect(navigation.attributes('role')).toBe('dialog')
    expect(navigation.attributes('aria-modal')).toBe('true')
    expect(document.activeElement).toBe(navigation.find('.nav-link').element)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(navigation.attributes('role')).toBe('complementary')
    expect(document.activeElement).toBe(menu.element)
  })
})
