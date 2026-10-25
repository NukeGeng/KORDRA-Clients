<script setup lang="ts">
import RecordTableView from '../RecordTableView.vue'
</script>

<template>
  <RecordTableView kind="releases" :only-queue="true" note="Preview-only controls. Approve and reject actions modify synthetic session data and add a demo audit record; they do not create real authority." />
</template>
