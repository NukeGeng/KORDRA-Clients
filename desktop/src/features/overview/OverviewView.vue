<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import ContextualToolbar from '../../components/toolbar/ContextualToolbar.vue'
import DataTable from '../../components/tables/DataTable.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import Icon from '../../components/Icon.vue'

const store = useDemoStore()
const router = useRouter()
const resources = computed(() => store.data.resources.filter((row) => row.environment === store.environment))
const releases = computed(() => store.data.releases.filter((row) => row.environment === store.environment))
const deployments = computed(() => store.data.deployments.filter((row) => row.environment === store.environment))
const outstanding = computed(() => releases.value.filter((row) => row.status === 'Pending'))
const attention = computed(() => resources.value.filter((row) => ['Degraded', 'Unknown', 'Failed'].includes(row.status ?? '')))
</script>

<template>
  <ContextualToolbar :environment="true" :search="false" :status-filter="false" :count="false">
    <button class="btn" type="button" @click="router.push('/approvals')"><Icon name="shield" />Review approvals</button>
    <button class="btn btn-primary" type="button" @click="store.openDialog({ type: 'release' })"><Icon name="plus" />New release</button>
  </ContextualToolbar>

  <div class="metrics">
    <div class="metric"><div class="metric-label">Workloads<Icon name="server" /></div><div class="metric-value numeric">{{ resources.length }}</div><div class="metric-note">Synthetic inventory items</div></div>
    <div class="metric"><div class="metric-label">Pending approvals<Icon name="shield" /></div><div class="metric-value numeric">{{ outstanding.length }}</div><div class="metric-note">Requests awaiting review</div></div>
    <div class="metric"><div class="metric-label">Deployment runs<Icon name="rocket" /></div><div class="metric-value numeric">{{ deployments.length }}</div><div class="metric-note">Recorded in sample timeline</div></div>
    <div class="metric"><div class="metric-label">Needs attention<Icon name="alert" /></div><div class="metric-value numeric">{{ attention.length }}</div><div class="metric-note">Degraded or unknown resources</div></div>
  </div>

  <div class="overview-grid">
    <section class="panel">
      <div class="panel-header">
        <div><h2>Release operations</h2><p>Illustrative delivery workflow</p></div>
        <button class="section-link" type="button" @click="router.push('/deployments')">View deployments <Icon name="arrowRight" :size="14" /></button>
      </div>
      <div class="release-path" aria-label="Illustrative release workflow">
        <div v-for="(step, index) in ['Artifact', 'Approval', 'Deploy', 'Verify', 'Recover']" :key="step" class="path-step" :class="{ complete: index < 2, active: index === 2 }"><span class="path-dot" /><span class="path-label">{{ step }}</span></div>
      </div>
      <div class="panel-content">
        <ul class="activity-list">
          <li v-for="deployment in deployments.slice(0, 3)" :key="deployment.id" class="activity-item">
            <span class="activity-icon"><Icon :name="deployment.status === 'Verified' ? 'check' : 'rocket'" /></span>
            <div class="activity-copy"><b>{{ deployment.name }}</b><span>{{ deployment.cluster }} · {{ deployment.id }}</span></div>
            <div class="activity-tail"><StatusBadge :status="deployment.status ?? 'Unknown'" /><small>{{ deployment.start }}</small></div>
            <button class="icon-button" type="button" :aria-label="`Inspect ${deployment.id}`" @click="store.openInspector('deployment', deployment.id)"><Icon name="chevronRight" /></button>
          </li>
        </ul>
        <p v-if="!deployments.length" class="empty-inline">No sample deployments for this environment.</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div><h2>Attention required</h2><p>Issues and decisions</p></div>
        <button class="section-link" type="button" @click="router.push('/approvals')">Approvals <Icon name="arrowRight" :size="14" /></button>
      </div>
      <div class="attention-summary"><Icon name="alert" /><div><b>{{ attention.length }} resource{{ attention.length === 1 ? '' : 's' }} need review</b><p>{{ attention.length ? 'Degraded and unknown are distinct. Verify before acting.' : 'No attention flags in this sample environment.' }}</p></div></div>
      <div v-for="release in outstanding.slice(0, 2)" :key="release.id" class="attention-row">
        <div class="attention-row-top"><div><h3>{{ release.name }}</h3><p>{{ release.id }} · Requested by {{ release.owner }}</p></div><StatusBadge :status="release.status ?? 'Pending'" /></div>
        <div class="attention-actions"><button class="mini-btn" type="button" @click="store.openInspector('release', release.id)">Review request</button><button class="mini-link" type="button" @click="router.push('/approvals')">Open queue <Icon name="arrowRight" :size="13" /></button></div>
      </div>
      <div v-if="!outstanding.length" class="attention-row"><h3>No pending approvals</h3><p>There are no sample requests for {{ store.environment }}.</p></div>
    </section>
  </div>

  <div class="section-top"><h2>Workload health</h2><button class="section-link" type="button" @click="router.push('/infrastructure')">Full inventory <Icon name="arrowRight" :size="14" /></button></div>
  <DataTable kind="resources" :rows="resources.slice(0, 5)" />
  <div class="dataset-meta">Sample environment: {{ store.environment }} · No live source connected</div>
</template>
