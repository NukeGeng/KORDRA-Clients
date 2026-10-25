<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import Icon from '../Icon.vue'
const store = useDemoStore()
</script>

<template>
  <div class="toast-root" role="status" aria-live="polite">
    <div v-if="store.toastMessage" class="toast"><Icon name="check" /><span class="text">{{ store.toastMessage }}</span><button type="button" aria-label="Dismiss message" @click="store.clearToast()"><Icon name="close" /></button></div>
  </div>
</template>
