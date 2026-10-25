import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDemoStore } from '../src/stores/demo'
import { createInitialDemoData } from '../src/fixtures/mockData'
import { toCsv } from '../src/composables/exportCsv'

describe('Desktop local preview workflows', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('filters and sorts sample inventory while keeping fixture data isolated', () => {
    const store = useDemoStore()
    const rows = store.data.resources.filter((row) => row.environment === 'Production')
    store.query = 'checkout'
    expect(store.filteredRows(rows).map((row) => row.id)).toEqual(['res-02'])
    store.query = ''
    store.toggleSort('name')
    expect(store.filteredRows(rows)[0]?.name).toBe('checkout-service')

    const fresh = createInitialDemoData()
    expect(fresh.resources[1]?.status).toBe('Degraded')
    expect(store.data.resources[1]?.status).toBe('Degraded')
  })

  it('creates drafts from an environment-matched immutable sample artifact', () => {
    const store = useDemoStore()
    expect(store.createRelease('  Checkout preview  ', 'art-01')?.name).toBe('Checkout preview')
    expect(store.data.releases[0]?.status).toBe('Draft')
    expect(store.data.audit[0]?.action).toBe('Sample draft created')
    expect(store.createRelease('Wrong target', 'art-04')).toBeNull()
  })

  it('requires a pending approval and advances only local deployment progress', () => {
    const store = useDemoStore()
    expect(store.decideRelease('REL-1041', 'Rejected')).toBe(false)
    expect(store.decideRelease('REL-1042', 'Approved')).toBe(true)
    expect(store.previewDeployment('REL-1042')?.status).toBe('Running')

    const id = store.data.deployments[0]!.id
    expect(store.advanceDeployment(id)).toBe(true)
    expect(store.data.deployments[0]?.status).toBe('Running')
    expect(store.advanceDeployment(id)).toBe(true)
    expect(store.data.deployments[0]?.status).toBe('Verifying')
    expect(store.advanceDeployment(id)).toBe(true)
    expect(store.data.deployments[0]?.status).toBe('Verified')
    expect(store.data.deployments[0]?.health).toBe('Healthy')
  })

  it('records rollback previews without changing deployment state', () => {
    const store = useDemoStore()
    expect(store.recordRollback('DEP-801')).toBe(true)
    expect(store.data.deployments.find((row) => row.id === 'DEP-801')?.status).toBe('Verified')
    expect(store.data.audit[0]?.action).toBe('Sample rollback request recorded')
    expect(store.recordRollback('DEP-802')).toBe(false)
  })

  it('exports CSV with quoted, escaped fields', () => {
    const result = toCsv([{ id: 'one', name: 'Service, "blue"' }], [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }])
    expect(result).toContain('"ID","Name"')
    expect(result).toContain('"one","Service, ""blue"""')
  })
})
