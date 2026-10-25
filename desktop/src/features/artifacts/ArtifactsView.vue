<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import RecordTableView from '../RecordTableView.vue'
import Icon from '../../components/Icon.vue'
const store = useDemoStore()
</script>

<template>
  <RecordTableView kind="artifacts" note="Registry registry.example · Identity by OCI digest · Synthetic discovery">
    <button class="btn" type="button" @click="store.setToast('This is a static demo dataset. No provider refresh was attempted.')"><Icon name="refresh" />Refresh sample</button>
  </RecordTableView>
</template>
