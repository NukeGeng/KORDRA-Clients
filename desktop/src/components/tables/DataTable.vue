<script setup lang="ts">
import { computed } from 'vue'
import { useDemoStore } from '../../stores/demo'
import type { DemoRow } from '../../fixtures/mockData'
import type { TableKind } from './tableConfigs'
import { displayValue, tableConfigs } from './tableConfigs'
import StatusBadge from '../StatusBadge.vue'
import EmptyState from '../EmptyState.vue'
import Icon from '../Icon.vue'

const props = defineProps<{ kind: TableKind; rows: DemoRow[] }>()
const store = useDemoStore()
const config = computed(() => tableConfigs[props.kind])
function inspect(id: string) { store.openInspector(config.value.entity, id) }
function isStatus(key: string) { return key === 'status' || key === 'result' }
function isEnvironment(key: string) { return key === 'environment' }
function environmentClass(value: string) { return value === 'Production' ? 'prod' : value === 'Staging' ? 'staging' : 'dev' }
function isMonospace(key: string) { return ['digest', 'version', 'port', 'address', 'at'].includes(key) }
function isName(key: string) { return ['name', 'image'].includes(key) }
</script>

<template>
  <div class="table-shell">
    <div v-if="store.filteredRows(rows).length" class="table-container" role="region" :aria-label="`${kind} sample records`" tabindex="0">
      <table>
        <thead><tr>
          <th v-for="column in config.columns" :key="column.key" :class="{ 'col-name': column.key === 'name' }" scope="col">
            <button type="button" :aria-label="`Sort by ${column.label}`" @click="store.toggleSort(column.key)">
              {{ column.label }}<Icon name="sort" :size="14" />
            </button>
          </th>
          <th class="col-actions" scope="col">Details</th>
        </tr></thead>
        <tbody>
          <tr v-for="row in store.filteredRows(rows)" :key="row.id">
            <td v-for="column in config.columns" :key="column.key">
              <span v-if="isStatus(column.key)"><StatusBadge :status="displayValue(row, column.key)" /></span>
              <span v-else-if="isEnvironment(column.key)" class="tag" :class="environmentClass(displayValue(row, column.key))">{{ displayValue(row, column.key) }}</span>
              <span v-else-if="isName(column.key)" class="table-main">
                <span v-if="column.key === 'name'" class="primary-icon"><Icon :name="config.icon" :size="15" /></span>
                <span class="table-text">{{ displayValue(row, column.key) }}</span>
              </span>
              <span v-else :class="{ mono: isMonospace(column.key) }">{{ displayValue(row, column.key) }}</span>
            </td>
            <td class="col-actions"><button class="action-inline" type="button" :aria-label="`Inspect ${row.name ?? row.id}`" @click="inspect(row.id)">Inspect <Icon name="arrowUpRight" :size="14" /></button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else :title="rows.length ? 'No matching results' : 'No sample records'" :description="rows.length ? 'Try another search or status filter.' : 'This dataset has no records for the selected environment.'">
      <button v-if="rows.length" class="btn" type="button" @click="store.resetFilters()">Clear filters</button>
    </EmptyState>
  </div>
</template>
