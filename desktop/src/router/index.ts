import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewView from '../features/overview/OverviewView.vue'
import InfrastructureView from '../features/infrastructure/InfrastructureView.vue'
import ArtifactsView from '../features/artifacts/ArtifactsView.vue'
import ReleasesView from '../features/releases/ReleasesView.vue'
import ApprovalsView from '../features/approvals/ApprovalsView.vue'
import DeploymentsView from '../features/deployments/DeploymentsView.vue'
import ConnectionsView from '../features/connections/ConnectionsView.vue'
import AuditView from '../features/audit/AuditView.vue'
import SettingsView from '../features/settings/SettingsView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    group: 'Operations' | 'Management'
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/overview' },
    { path: '/overview', name: 'overview', component: OverviewView, meta: { title: 'Overview', group: 'Operations' } },
    { path: '/infrastructure', name: 'infrastructure', component: InfrastructureView, meta: { title: 'Infrastructure', group: 'Operations' } },
    { path: '/artifacts', name: 'artifacts', component: ArtifactsView, meta: { title: 'Artifacts', group: 'Operations' } },
    { path: '/releases', name: 'releases', component: ReleasesView, meta: { title: 'Releases', group: 'Operations' } },
    { path: '/approvals', name: 'approvals', component: ApprovalsView, meta: { title: 'Approvals', group: 'Operations' } },
    { path: '/deployments', name: 'deployments', component: DeploymentsView, meta: { title: 'Deployments', group: 'Operations' } },
    { path: '/connections', name: 'connections', component: ConnectionsView, meta: { title: 'Connections', group: 'Management' } },
    { path: '/audit', name: 'audit', component: AuditView, meta: { title: 'Audit log', group: 'Management' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { title: 'Settings', group: 'Management' } },
  ],
})

export default router
