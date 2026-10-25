<script setup lang="ts">
import { computed } from 'vue'
import { useDemoStore } from '../../stores/demo'
import type { TableKind } from '../../components/tables/tableConfigs'
import { csvColumns } from '../../components/tables/tableConfigs'
import ContextualToolbar from '../../components/toolbar/ContextualToolbar.vue'
import DataTable from '../../components/tables/DataTable.vue'
import Icon from '../../components/Icon.vue'

const store = useDemoStore()
const tabs = [
  { key: 'workloads', label: 'Workloads', kind: 'resources' as TableKind },
  { key: 'nodes', label: 'Nodes', kind: 'nodes' as TableKind },
  { key: 'services', label: 'Services', kind: 'services' as TableKind },
  { key: 'storage', label: 'Storage (PVC)', kind: 'storage' as TableKind },
]
const activeTab = computed(() => tabs.find((tab) => tab.key === store.infrastructureTab) ?? tabs[0]!)
const rows = computed(() => store.data[activeTab.value.kind].filter((row) => row.environment === store.environment))
function rowCount(kind: TableKind) { return store.data[kind].filter((row) => row.environment === store.environment).length }
</script>

<template>
  <ContextualToolbar :kind="activeTab.kind" :rows="rows" :columns="csvColumns(activeTab.kind)">
    <button class="btn" type="button" @click="store.openDialog({ type: 'connectionGuide' })"><Icon name="plug" />Connection guide</button>
  </ContextualToolbar>
  <div class="scope-ribbon">Scope <b>{{ store.environment }}</b><span class="hint-sep" />Kubernetes / Helm<span class="hint-sep" />No credential access</div>
  <div class="tabs" role="tablist" aria-label="Infrastructure resource type">
    <button v-for="tab in tabs" :key="tab.key" type="button" role="tab" class="tab" :class="{ active: store.infrastructureTab === tab.key }" :aria-selected="store.infrastructureTab === tab.key" @click="store.setInfrastructureTab(tab.key)">
      {{ tab.label }}<span class="pill-count">{{ rowCount(tab.kind) }}</span>
    </button>
  </div>
  <DataTable :kind="activeTab.kind" :rows="rows" />
</template>
