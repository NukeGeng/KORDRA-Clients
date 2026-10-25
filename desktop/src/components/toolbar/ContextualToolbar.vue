<script setup lang="ts">
import { computed } from 'vue'
import type { DemoRow } from '../../fixtures/mockData'
import { useDemoStore } from '../../stores/demo'
import { downloadCsv, type CsvColumn } from '../../composables/exportCsv'
import Icon from '../Icon.vue'

const props = withDefaults(defineProps<{
  kind?: string
  rows?: DemoRow[]
  columns?: CsvColumn[]
  environment?: boolean
  search?: boolean
  statusFilter?: boolean
  count?: boolean
}>(), { environment: true, search: true, statusFilter: true, count: true })

const store = useDemoStore()
const visibleRows = computed(() => store.filteredRows(props.rows ?? []))
const availableStatuses = computed(() => [...new Set((props.rows ?? []).map((row) => String(row.status ?? row.result ?? 'Unknown')))])
function exportRows() {
  if (!props.kind || !props.columns) return
  downloadCsv(`kordra-preview-${props.kind}-${store.environment.toLowerCase()}.csv`, visibleRows.value, props.columns)
  store.setToast(`Exported ${visibleRows.value.length} synthetic ${props.kind} rows.`)
}
</script>

<template>
  <div class="context-toolbar" role="toolbar" :aria-label="`${$route.meta.title ?? 'Workspace'} tools`">
    <div class="toolbar-start">
      <label v-if="environment" class="env-picker">
        <Icon name="server" :size="16" />
        <span class="env-square" />
        <select :value="store.environment" aria-label="Active environment" @change="store.setEnvironment(($event.target as HTMLSelectElement).value as typeof store.environment)">
          <option value="Production">Production</option>
          <option value="Staging">Staging</option>
          <option value="Development">Development</option>
        </select>
      </label>
      <label v-if="search && kind" class="table-search toolbar-search">
        <Icon name="search" :size="15" />
        <input v-model="store.query" type="search" :placeholder="`Search ${kind}...`" :aria-label="`Search ${kind}`" />
      </label>
      <select v-if="statusFilter && kind" v-model="store.statusFilter" class="select toolbar-filter" aria-label="Filter records by status">
        <option value="All">All statuses</option>
        <option v-for="status in availableStatuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>
    <div class="toolbar-end">
      <span v-if="count && rows" class="toolbar-count" aria-live="polite">{{ visibleRows.length }} of {{ rows.length }} sample records</span>
      <button v-if="kind && columns" class="btn" type="button" @click="exportRows"><Icon name="download" />Export CSV</button>
      <slot />
    </div>
  </div>
</template>
