<script setup lang="ts">
import { computed } from 'vue'
import type { DemoRow } from '../fixtures/mockData'
import type { TableKind } from '../components/tables/tableConfigs'
import { csvColumns } from '../components/tables/tableConfigs'
import { useDemoStore } from '../stores/demo'
import ContextualToolbar from '../components/toolbar/ContextualToolbar.vue'
import DataTable from '../components/tables/DataTable.vue'

const props = defineProps<{ kind: TableKind; note?: string; withEnvironment?: boolean; onlyQueue?: boolean }>()
const store = useDemoStore()
const source = computed<DemoRow[]>(() => {
  let rows = store.data[props.kind]
  if (props.withEnvironment !== false) rows = rows.filter((row) => row.environment === store.environment)
  if (props.onlyQueue) rows = rows.filter((row) => ['Pending', 'Approved', 'Rejected'].includes(row.status ?? ''))
  return rows
})
</script>

<template>
  <ContextualToolbar :kind="kind" :rows="source" :columns="csvColumns(kind)" :environment="withEnvironment !== false">
    <slot />
  </ContextualToolbar>
  <div v-if="note" class="scope-ribbon">{{ note }}</div>
  <DataTable :kind="kind" :rows="source" />
</template>
