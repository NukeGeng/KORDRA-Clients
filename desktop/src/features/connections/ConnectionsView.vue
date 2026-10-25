<script setup lang="ts">
import { computed } from 'vue'
import { useDemoStore } from '../../stores/demo'
import { csvColumns } from '../../components/tables/tableConfigs'
import ContextualToolbar from '../../components/toolbar/ContextualToolbar.vue'
import DataTable from '../../components/tables/DataTable.vue'
import Icon from '../../components/Icon.vue'

const store = useDemoStore()
const rows = computed(() => store.data.connections)
</script>

<template>
  <ContextualToolbar kind="connections" :rows="rows" :columns="csvColumns('connections')" :environment="false" :search="false" :status-filter="false">
    <button class="btn" type="button" @click="store.openDialog({ type: 'connectionGuide' })"><Icon name="help" />Setup guide</button>
  </ContextualToolbar>
  <div class="table-toolbar"><div class="left"><h2>Connection profiles</h2><span class="subtle">Planned integrations</span></div></div>
  <DataTable kind="connections" :rows="rows" />
  <div class="dataset-meta">No credential form is enabled. Secret references and provider integration require accepted contracts and backend implementation.</div>
</template>
