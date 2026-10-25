import type { DemoRow } from '../../fixtures/mockData'
import type { EntityType } from '../../stores/demo'

export type TableKind = 'resources' | 'nodes' | 'services' | 'storage' | 'artifacts' | 'releases' | 'deployments' | 'audit' | 'connections'
export interface TableColumn { key: string; label: string }
export interface TableConfig { columns: TableColumn[]; entity: EntityType; icon: string }

export const tableConfigs: Record<TableKind, TableConfig> = {
  resources: { columns: [{ key: 'name', label: 'Workload' }, { key: 'namespace', label: 'Namespace' }, { key: 'cluster', label: 'Cluster' }, { key: 'status', label: 'Status' }, { key: 'replicas', label: 'Ready' }, { key: 'version', label: 'Version' }], entity: 'resource', icon: 'package' },
  nodes: { columns: [{ key: 'name', label: 'Node' }, { key: 'role', label: 'Role' }, { key: 'cluster', label: 'Cluster' }, { key: 'status', label: 'Status' }, { key: 'cpu', label: 'CPU' }, { key: 'memory', label: 'Memory' }, { key: 'version', label: 'Kubernetes' }], entity: 'node', icon: 'server' },
  services: { columns: [{ key: 'name', label: 'Service' }, { key: 'namespace', label: 'Namespace' }, { key: 'type', label: 'Type' }, { key: 'address', label: 'Cluster IP' }, { key: 'port', label: 'Port' }, { key: 'status', label: 'Status' }], entity: 'service', icon: 'layers' },
  storage: { columns: [{ key: 'name', label: 'Volume' }, { key: 'namespace', label: 'Namespace' }, { key: 'className', label: 'Storage class' }, { key: 'capacity', label: 'Capacity' }, { key: 'mode', label: 'Access' }, { key: 'status', label: 'Status' }], entity: 'storage', icon: 'database' },
  artifacts: { columns: [{ key: 'image', label: 'Image' }, { key: 'tag', label: 'Tag' }, { key: 'digest', label: 'Digest' }, { key: 'platform', label: 'Platform' }, { key: 'status', label: 'Identity' }, { key: 'updated', label: 'Discovered' }], entity: 'artifact', icon: 'package' },
  releases: { columns: [{ key: 'id', label: 'Release ID' }, { key: 'name', label: 'Release' }, { key: 'environment', label: 'Environment' }, { key: 'version', label: 'Version' }, { key: 'owner', label: 'Requested by' }, { key: 'status', label: 'Status' }, { key: 'created', label: 'Created' }], entity: 'release', icon: 'layers' },
  deployments: { columns: [{ key: 'id', label: 'Operation' }, { key: 'name', label: 'Deployment' }, { key: 'environment', label: 'Environment' }, { key: 'cluster', label: 'Target' }, { key: 'status', label: 'Status' }, { key: 'start', label: 'Started' }, { key: 'duration', label: 'Duration' }], entity: 'deployment', icon: 'rocket' },
  audit: { columns: [{ key: 'at', label: 'Time' }, { key: 'actor', label: 'Actor' }, { key: 'action', label: 'Action' }, { key: 'resource', label: 'Resource' }, { key: 'environment', label: 'Environment' }, { key: 'result', label: 'Result' }], entity: 'audit', icon: 'audit' },
  connections: { columns: [{ key: 'name', label: 'Target' }, { key: 'provider', label: 'Provider' }, { key: 'environment', label: 'Environment' }, { key: 'status', label: 'Status' }, { key: 'purpose', label: 'Purpose' }], entity: 'connection', icon: 'plug' },
}

export function csvColumns(kind: TableKind): { key: string; label: string }[] {
  return tableConfigs[kind].columns
}

export function displayValue(row: DemoRow, key: string): string {
  const value = row[key]
  return Array.isArray(value) ? value.join(', ') : String(value ?? '—')
}
