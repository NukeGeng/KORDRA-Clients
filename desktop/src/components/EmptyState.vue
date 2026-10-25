<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{ title: string; description: string }>()
</script>

<template>
  <div class="empty">
    <Icon name="search" />
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>
