<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import RecordTableView from '../RecordTableView.vue'
import Icon from '../../components/Icon.vue'
const store = useDemoStore()
</script>

<template>
  <RecordTableView kind="releases" note="Approval state is simulated locally. Real authorizations remain server-owned.">
    <button class="btn btn-primary" type="button" @click="store.openDialog({ type: 'release' })"><Icon name="plus" />New release</button>
  </RecordTableView>
</template>
