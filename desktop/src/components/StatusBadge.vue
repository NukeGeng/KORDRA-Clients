<script setup lang="ts">
import type { SampleStatus } from '../fixtures/mockData'

defineProps<{ status: SampleStatus | string }>()
</script>

<template>
  <span class="status" :class="status.toLowerCase().replace(/\s+/g, '-')">{{ status }}</span>
</template>
