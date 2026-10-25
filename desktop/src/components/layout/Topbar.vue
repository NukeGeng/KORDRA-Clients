<script setup lang="ts">
import Icon from '../Icon.vue'

defineProps<{ title: string; mobileOpen: boolean }>()
const emit = defineEmits<{ search: []; menu: []; about: [] }>()
</script>

<template>
  <header class="topbar">
    <div class="topbar-breadcrumb">
      <button id="menu-toggle" class="icon-button mobile-menu" type="button" :aria-expanded="mobileOpen" aria-controls="primary-navigation" :aria-label="mobileOpen ? 'Close navigation' : 'Open navigation'" @click="emit('menu')"><Icon :name="mobileOpen ? 'close' : 'menu'" /></button>
      <span class="breadcrumb-root">KORDRA</span>
      <span class="crumb-sep"><Icon name="chevronRight" :size="14" /></span>
      <h1 class="breadcrumb-current">{{ title }}</h1>
    </div>
    <div class="topbar-actions">
      <button class="search-trigger" type="button" aria-label="Search resources..." @click="emit('search')">
        <Icon name="search" :size="15" /><span>Search resources...</span><kbd aria-hidden="true">⌘ K</kbd>
      </button>
      <span class="topbar-divider" />
      <span class="connection-label"><span class="connection-dot" /> Offline preview</span>
      <button class="icon-button help-button" type="button" aria-label="About this preview" @click="emit('about')"><Icon name="help" /></button>
    </div>
  </header>
</template>
