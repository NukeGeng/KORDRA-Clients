import { defineStore } from 'pinia'
import {
  createInitialDemoData,
  type DemoData,
  type DemoRow,
  type Environment,
  type SampleStatus,
} from '../fixtures/mockData'

export type EntityType =
  | 'resource'
  | 'node'
  | 'service'
  | 'storage'
  | 'artifact'
  | 'release'
  | 'deployment'
  | 'audit'
  | 'connection'

export type DemoDialog =
  | { type: 'release' }
  | { type: 'approve'; id: string }
  | { type: 'reject'; id: string }
  | { type: 'deploy'; id: string }
  | { type: 'rollback'; id: string }
  | { type: 'reset' }
  | { type: 'about' }
  | { type: 'connectionGuide' }

const entityCollections: Record<EntityType, keyof DemoData> = {
  resource: 'resources',
  node: 'nodes',
  service: 'services',
  storage: 'storage',
  artifact: 'artifacts',
  release: 'releases',
  deployment: 'deployments',
  audit: 'audit',
  connection: 'connections',
}

export const useDemoStore = defineStore('desktop-demo', {
  state: () => ({
    data: createInitialDemoData() as DemoData,
    environment: 'Production' as Environment,
    infrastructureTab: 'workloads',
    query: '',
    statusFilter: 'All',
    sort: { key: '', direction: 1 as 1 | -1 },
    compact: false,
    selected: null as { type: EntityType; id: string } | null,
    dialog: null as DemoDialog | null,
    commandOpen: false,
    mobileNavOpen: false,
    toastMessage: '',
  }),
  getters: {
    selectedRecord(state): DemoRow | null {
      if (!state.selected) return null
      const collection = entityCollections[state.selected.type]
      return state.data[collection].find((row) => row.id === state.selected?.id) ?? null
    },
    pendingApprovalCount(state): number {
      return state.data.releases.filter((release) => release.status === 'Pending').length
    },
  },
  actions: {
    setEnvironment(environment: Environment) {
      this.environment = environment
      this.resetFilters()
    },
    setInfrastructureTab(tab: string) {
      this.infrastructureTab = tab
      this.resetFilters()
    },
    resetFilters() {
      this.query = ''
      this.statusFilter = 'All'
      this.sort = { key: '', direction: 1 }
    },
    toggleSort(key: string) {
      this.sort = this.sort.key === key
        ? { key, direction: this.sort.direction === 1 ? -1 : 1 }
        : { key, direction: 1 }
    },
    filteredRows(rows: DemoRow[]): DemoRow[] {
      let result = rows.filter((row) => {
        if (this.statusFilter === 'All') return true
        return (row.status ?? row.result) === this.statusFilter
      })
      const search = this.query.trim().toLowerCase()
      if (search) {
        result = result.filter((row) =>
          Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(search)),
        )
      }
      if (this.sort.key) {
        const { key, direction } = this.sort
        result = [...result].sort((left, right) =>
          String(left[key] ?? '').localeCompare(String(right[key] ?? ''), undefined, { numeric: true }) * direction,
        )
      }
      return result
    },
    openInspector(type: EntityType, id: string) {
      this.selected = { type, id }
      this.dialog = null
      this.commandOpen = false
      this.mobileNavOpen = false
    },
    closeInspector() {
      this.selected = null
    },
    openDialog(dialog: DemoDialog) {
      this.dialog = dialog
      this.commandOpen = false
    },
    closeDialog() {
      this.dialog = null
    },
    setToast(message: string) {
      this.toastMessage = message
    },
    clearToast() {
      this.toastMessage = ''
    },
    addAudit(action: string, resource: string, result: SampleStatus, environment?: Environment) {
      this.data.audit.unshift({
        id: 'evt-demo-' + String(this.data.audit.length + 1).padStart(3, '0'),
        at: 'Just now',
        actor: 'Demo operator',
        action,
        resource,
        environment: environment ?? this.environment,
        result,
        note: 'Added in this local preview session; no Product request was sent.',
      })
    },
    createRelease(name: string, artifactId: string): DemoRow | null {
      const artifact = this.data.artifacts.find(
        (item) => item.id === artifactId && item.environment === this.environment,
      )
      const safeName = name.trim()
      if (!artifact || !safeName || safeName.length > 70) return null
      const release: DemoRow = {
        id: 'REL-D' + String(this.data.releases.length + 1).padStart(3, '0'),
        name: safeName,
        application: artifact.image?.split('/').at(-1) ?? 'sample',
        environment: this.environment,
        version: artifact.tag ?? 'Unknown',
        status: 'Draft',
        owner: 'Demo operator',
        created: 'Now',
        artifact: artifact.digest ?? '',
        note: 'Locally created sample draft. No backend state.',
      }
      this.data.releases.unshift(release)
      this.addAudit('Sample draft created', release.id, 'Draft')
      return release
    },
    decideRelease(id: string, decision: 'Approved' | 'Rejected') {
      const release = this.data.releases.find((item) => item.id === id)
      if (!release || release.status !== 'Pending') return false
      release.status = decision
      this.addAudit('Sample release ' + decision.toLowerCase(), id, decision, release.environment as Environment)
      return true
    },
    previewDeployment(id: string): DemoRow | null {
      const release = this.data.releases.find((item) => item.id === id)
      if (!release || release.status !== 'Approved') return null
      const environment = release.environment as Environment
      const cluster = environment === 'Production'
        ? 'cluster-east-01'
        : environment === 'Staging' ? 'cluster-stg-01' : 'cluster-dev-01'
      const deployment: DemoRow = {
        id: 'DEP-D' + String(this.data.deployments.length + 1).padStart(3, '0'),
        name: release.name,
        application: release.application ?? '',
        environment,
        cluster,
        status: 'Running',
        start: 'Now',
        duration: '—',
        health: 'Unknown',
        version: release.version ?? 'Unknown',
        release: release.id,
        steps: ['done', 'current', 'wait', 'wait'],
        note: 'Synthetic operation created by preview; no provider execution.',
      }
      this.data.deployments.unshift(deployment)
      this.addAudit('Sample deployment preview created', deployment.id, 'Running', environment)
      return deployment
    },
    recordRollback(id: string) {
      const deployment = this.data.deployments.find((item) => item.id === id)
      if (!deployment || deployment.status !== 'Verified') return false
      this.addAudit('Sample rollback request recorded', id, 'Pending', deployment.environment as Environment)
      return true
    },
    advanceDeployment(id: string) {
      const deployment = this.data.deployments.find((item) => item.id === id)
      if (!deployment || !['Running', 'Verifying'].includes(deployment.status ?? '')) return false
      const steps = deployment.steps ?? ['done', 'current', 'wait', 'wait']
      const current = steps.findIndex((step) => step === 'current')
      if (current < 0 || current === steps.length - 1) {
        deployment.steps = steps.map(() => 'done')
        deployment.status = 'Verified'
        deployment.health = 'Healthy'
        deployment.note = 'All sample verification steps passed in this preview session.'
        this.addAudit('Sample deployment verified', id, 'Verified', deployment.environment as Environment)
      } else {
        deployment.steps = steps.map((step, index) => index === current ? 'done' : index === current + 1 ? 'current' : step)
        deployment.status = current + 1 === steps.length - 1 ? 'Verifying' : 'Running'
        deployment.note = 'Progress advanced manually in the local preview; no provider operation occurred.'
        this.addAudit('Sample deployment progress advanced', id, deployment.status ?? 'Running', deployment.environment as Environment)
      }
      return true
    },
    resetDemo() {
      this.data = createInitialDemoData()
      this.resetFilters()
      this.selected = null
      this.dialog = null
    },
    toggleCompact() {
      this.compact = !this.compact
    },
  },
})
