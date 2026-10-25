export type Environment = 'Production' | 'Staging' | 'Development'
export type SampleStatus =
  | 'Healthy'
  | 'Degraded'
  | 'Failed'
  | 'Unknown'
  | 'Unavailable'
  | 'Denied'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Draft'
  | 'Running'
  | 'Verifying'
  | 'Verified'
  | 'Success'

export interface DemoRow {
  id: string
  environment?: Environment
  status?: SampleStatus
  result?: SampleStatus
  name?: string
  image?: string
  tag?: string
  digest?: string
  application?: string
  version?: string
  cluster?: string
  steps?: string[]
  note?: string
  [key: string]: string | string[] | undefined
}

export interface DemoData {
  resources: DemoRow[]
  nodes: DemoRow[]
  services: DemoRow[]
  storage: DemoRow[]
  artifacts: DemoRow[]
  releases: DemoRow[]
  deployments: DemoRow[]
  audit: DemoRow[]
  connections: DemoRow[]
}

const initial: DemoData = {
  resources: [
    { id: 'res-01', name: 'gateway-api', kind: 'Deployment', namespace: 'edge-system', environment: 'Production', status: 'Healthy', replicas: '3 / 3', version: 'v2.8.1', cluster: 'cluster-east-01', age: '12d', cpu: '46%', memory: '1.2 GiB' },
    { id: 'res-02', name: 'checkout-service', kind: 'Deployment', namespace: 'commerce', environment: 'Production', status: 'Degraded', replicas: '2 / 3', version: 'v1.14.1', cluster: 'cluster-east-01', age: '4d', cpu: '81%', memory: '2.4 GiB' },
    { id: 'res-03', name: 'events-worker', kind: 'Deployment', namespace: 'platform', environment: 'Production', status: 'Healthy', replicas: '4 / 4', version: 'v3.1.0', cluster: 'cluster-east-01', age: '8d', cpu: '32%', memory: '768 MiB' },
    { id: 'res-04', name: 'web-frontend', kind: 'Deployment', namespace: 'web', environment: 'Production', status: 'Healthy', replicas: '5 / 5', version: 'v4.5.0', cluster: 'cluster-east-01', age: '2d', cpu: '17%', memory: '512 MiB' },
    { id: 'res-05', name: 'payments-processor', kind: 'Deployment', namespace: 'commerce', environment: 'Production', status: 'Unknown', replicas: '—', version: 'Unknown', cluster: 'cluster-west-02', age: '—', cpu: 'Unknown', memory: 'Unknown' },
    { id: 'res-06', name: 'auth-service', kind: 'Deployment', namespace: 'security', environment: 'Staging', status: 'Healthy', replicas: '2 / 2', version: 'v2.6.0-rc2', cluster: 'cluster-stg-01', age: '1d', cpu: '25%', memory: '480 MiB' },
    { id: 'res-07', name: 'orders-api', kind: 'Deployment', namespace: 'commerce', environment: 'Staging', status: 'Healthy', replicas: '1 / 1', version: 'v1.19.0-rc1', cluster: 'cluster-stg-01', age: '3h', cpu: '22%', memory: '290 MiB' },
    { id: 'res-08', name: 'gateway-api', kind: 'Deployment', namespace: 'edge-system', environment: 'Development', status: 'Healthy', replicas: '1 / 1', version: 'v2.9.0-dev', cluster: 'cluster-dev-01', age: '4h', cpu: '13%', memory: '192 MiB' },
    { id: 'res-09', name: 'local-event-worker', kind: 'Deployment', namespace: 'platform', environment: 'Development', status: 'Healthy', replicas: '1 / 1', version: 'v3.2.0-dev', cluster: 'cluster-dev-01', age: '2h', cpu: '9%', memory: '128 MiB' },
  ],
  nodes: [
    { id: 'node-01', name: 'worker-east-01', role: 'Worker', environment: 'Production', status: 'Healthy', cpu: '42%', memory: '12.8 GiB / 32 GiB', version: 'v1.32.3', cluster: 'cluster-east-01', age: '36d' },
    { id: 'node-02', name: 'worker-east-02', role: 'Worker', environment: 'Production', status: 'Healthy', cpu: '59%', memory: '18.3 GiB / 32 GiB', version: 'v1.32.3', cluster: 'cluster-east-01', age: '36d' },
    { id: 'node-03', name: 'worker-west-01', role: 'Worker', environment: 'Production', status: 'Unknown', cpu: 'Unknown', memory: 'Unknown', version: 'Unknown', cluster: 'cluster-west-02', age: '—' },
    { id: 'node-04', name: 'worker-stg-01', role: 'Worker', environment: 'Staging', status: 'Healthy', cpu: '18%', memory: '5.1 GiB / 16 GiB', version: 'v1.32.3', cluster: 'cluster-stg-01', age: '9d' },
    { id: 'node-05', name: 'worker-dev-01', role: 'Worker', environment: 'Development', status: 'Healthy', cpu: '8%', memory: '2.3 GiB / 8 GiB', version: 'v1.32.3', cluster: 'cluster-dev-01', age: '5d' },
  ],
  services: [
    { id: 'svc-01', name: 'gateway-api', namespace: 'edge-system', environment: 'Production', status: 'Healthy', type: 'ClusterIP', address: '10.96.10.12', port: '8080/TCP', cluster: 'cluster-east-01' },
    { id: 'svc-02', name: 'checkout-service', namespace: 'commerce', environment: 'Production', status: 'Degraded', type: 'ClusterIP', address: '10.96.11.24', port: '8080/TCP', cluster: 'cluster-east-01' },
    { id: 'svc-03', name: 'web-frontend', namespace: 'web', environment: 'Production', status: 'Healthy', type: 'LoadBalancer', address: 'Sample only', port: '443/TCP', cluster: 'cluster-east-01' },
    { id: 'svc-04', name: 'orders-api', namespace: 'commerce', environment: 'Staging', status: 'Healthy', type: 'ClusterIP', address: '10.96.17.12', port: '8080/TCP', cluster: 'cluster-stg-01' },
    { id: 'svc-05', name: 'gateway-api', namespace: 'edge-system', environment: 'Development', status: 'Healthy', type: 'ClusterIP', address: '10.96.19.09', port: '8080/TCP', cluster: 'cluster-dev-01' },
  ],
  storage: [
    { id: 'vol-01', name: 'postgres-data-01', namespace: 'platform', environment: 'Production', status: 'Healthy', capacity: '120 GiB', mode: 'RWO', className: 'fast-ssd', age: '44d' },
    { id: 'vol-02', name: 'redis-data', namespace: 'platform', environment: 'Production', status: 'Healthy', capacity: '20 GiB', mode: 'RWO', className: 'standard', age: '28d' },
    { id: 'vol-03', name: 'file-cache', namespace: 'web', environment: 'Staging', status: 'Healthy', capacity: '10 GiB', mode: 'RWX', className: 'shared', age: '7d' },
  ],
  artifacts: [
    { id: 'art-01', image: 'registry.example/commerce/checkout', tag: 'v1.14.2', digest: 'sha256:8ac27e5b40d7…', platform: 'linux/amd64', environment: 'Production', updated: '2 hours ago', status: 'Verified', size: '186 MB' },
    { id: 'art-02', image: 'registry.example/platform/gateway', tag: 'v2.8.1', digest: 'sha256:fb93e42c1179…', platform: 'linux/amd64', environment: 'Production', updated: 'Yesterday', status: 'Verified', size: '142 MB' },
    { id: 'art-03', image: 'registry.example/web/frontend', tag: 'v4.5.0', digest: 'sha256:023ab19599c2…', platform: 'linux/amd64', environment: 'Production', updated: '2 days ago', status: 'Verified', size: '79 MB' },
    { id: 'art-04', image: 'registry.example/security/auth', tag: 'v2.6.0-rc2', digest: 'sha256:41f2a9bb14cc…', platform: 'linux/arm64', environment: 'Staging', updated: '3 hours ago', status: 'Verified', size: '163 MB' },
    { id: 'art-05', image: 'registry.example/platform/gateway', tag: 'v2.9.0-dev', digest: 'sha256:97afff0d55c1…', platform: 'linux/amd64', environment: 'Development', updated: '40 minutes ago', status: 'Unknown', size: '143 MB' },
  ],
  releases: [
    { id: 'REL-1042', name: 'Checkout service v1.14.2', application: 'checkout-service', environment: 'Production', version: 'v1.14.2', status: 'Pending', owner: 'M. Torres', created: '09:46', artifact: 'sha256:8ac27e5b40d7…', note: 'Ready for production approval. Verification is required after deployment.' },
    { id: 'REL-1041', name: 'Gateway API v2.8.1', application: 'gateway-api', environment: 'Production', version: 'v2.8.1', status: 'Approved', owner: 'A. Chen', created: '09:18', artifact: 'sha256:fb93e42c1179…', note: 'Approved for production rollout with health checks.' },
    { id: 'REL-1040', name: 'Web frontend v4.5.0', application: 'web-frontend', environment: 'Production', version: 'v4.5.0', status: 'Approved', owner: 'L. Park', created: 'Yesterday', artifact: 'sha256:023ab19599c2…', note: 'Frontend release candidate.' },
    { id: 'REL-1039', name: 'Auth service v2.6.0-rc2', application: 'auth-service', environment: 'Staging', version: 'v2.6.0-rc2', status: 'Pending', owner: 'S. Patel', created: '08:55', artifact: 'sha256:41f2a9bb14cc…', note: 'Staging smoke-test candidate.' },
    { id: 'REL-1038', name: 'Orders API v1.19.0-rc1', application: 'orders-api', environment: 'Staging', version: 'v1.19.0-rc1', status: 'Rejected', owner: 'S. Patel', created: 'Yesterday', artifact: 'sha256:9ca015…', note: 'Rejected due to incomplete test evidence.' },
    { id: 'REL-1037', name: 'Gateway API v2.9.0-dev', application: 'gateway-api', version: 'v2.9.0-dev', environment: 'Development', status: 'Draft', owner: 'M. Torres', created: 'Yesterday', artifact: 'sha256:97afff0d55c1…', note: 'Working release draft.' },
  ],
  deployments: [
    { id: 'DEP-802', name: 'Checkout service v1.14.1', application: 'checkout-service', environment: 'Production', cluster: 'cluster-east-01', status: 'Running', start: '10:02', duration: '4m 20s', health: 'Degraded', version: 'v1.14.1', release: 'REL-1036', steps: ['done', 'done', 'current', 'wait'], note: 'Waiting for workload replicas to become ready.' },
    { id: 'DEP-801', name: 'Gateway API v2.8.1', application: 'gateway-api', environment: 'Production', cluster: 'cluster-east-01', status: 'Verified', start: '09:24', duration: '3m 08s', health: 'Healthy', version: 'v2.8.1', release: 'REL-1041', steps: ['done', 'done', 'done', 'done'], note: 'All synthetic verification checks passed.' },
    { id: 'DEP-800', name: 'Web frontend v4.5.0', application: 'web-frontend', environment: 'Production', cluster: 'cluster-east-01', status: 'Verified', start: 'Yesterday', duration: '2m 42s', health: 'Healthy', version: 'v4.5.0', release: 'REL-1040', steps: ['done', 'done', 'done', 'done'], note: 'Release verified in sample timeline.' },
    { id: 'DEP-799', name: 'Auth service v2.6.0-rc2', application: 'auth-service', environment: 'Staging', cluster: 'cluster-stg-01', status: 'Failed', start: '08:31', duration: '1m 52s', health: 'Unknown', version: 'v2.6.0-rc2', release: 'REL-1039', steps: ['done', 'done', 'current', 'wait'], note: 'Simulated readiness probe timeout.' },
    { id: 'DEP-798', name: 'Gateway API v2.9.0-dev', application: 'gateway-api', environment: 'Development', cluster: 'cluster-dev-01', status: 'Verified', start: 'Yesterday', duration: '48s', health: 'Healthy', version: 'v2.9.0-dev', release: 'REL-1037', steps: ['done', 'done', 'done', 'done'], note: 'Local development demo deployment.' },
  ],
  audit: [
    { id: 'evt-01', at: '10:02:14', actor: 'Demo operator', action: 'Deployment started', resource: 'DEP-802', environment: 'Production', result: 'Running' },
    { id: 'evt-02', at: '09:46:37', actor: 'M. Torres', action: 'Release requested', resource: 'REL-1042', environment: 'Production', result: 'Pending' },
    { id: 'evt-03', at: '09:24:01', actor: 'A. Chen', action: 'Deployment verified', resource: 'DEP-801', environment: 'Production', result: 'Verified' },
    { id: 'evt-04', at: '09:18:12', actor: 'L. Park', action: 'Release approved', resource: 'REL-1041', environment: 'Production', result: 'Approved' },
    { id: 'evt-05', at: '08:55:43', actor: 'S. Patel', action: 'Release requested', resource: 'REL-1039', environment: 'Staging', result: 'Pending' },
    { id: 'evt-06', at: 'Yesterday', actor: 'Demo operator', action: 'Release rejected', resource: 'REL-1038', environment: 'Staging', result: 'Rejected' },
    { id: 'evt-07', at: 'Yesterday', actor: 'Demo operator', action: 'Access outcome illustrated', resource: 'cluster-west-02', environment: 'Production', result: 'Denied', note: 'Illustrative state only; no access request was made.' },
  ],
  connections: [
    { id: 'conn-01', name: 'cluster-east-01', provider: 'Kubernetes', environment: 'Production', status: 'Unavailable', purpose: 'Read-only inventory preview' },
    { id: 'conn-02', name: 'cluster-stg-01', provider: 'Kubernetes', environment: 'Staging', status: 'Unavailable', purpose: 'Read-only inventory preview' },
    { id: 'conn-03', name: 'registry.example', provider: 'OCI Registry', environment: 'Production', status: 'Unavailable', purpose: 'Artifact digest discovery' },
    { id: 'conn-04', name: 'cluster-west-02', provider: 'Kubernetes', environment: 'Production', status: 'Denied', purpose: 'Illustrative access state; no request was made' },
  ],
}

export function createInitialDemoData(): DemoData {
  return {
    resources: initial.resources.map((row) => ({ ...row })),
    nodes: initial.nodes.map((row) => ({ ...row })),
    services: initial.services.map((row) => ({ ...row })),
    storage: initial.storage.map((row) => ({ ...row })),
    artifacts: initial.artifacts.map((row) => ({ ...row })),
    releases: initial.releases.map((row) => ({ ...row })),
    deployments: initial.deployments.map((row) => ({ ...row, steps: row.steps ? [...row.steps] : undefined })),
    audit: initial.audit.map((row) => ({ ...row })),
    connections: initial.connections.map((row) => ({ ...row })),
  }
}

export const environments: Environment[] = ['Production', 'Staging', 'Development']
