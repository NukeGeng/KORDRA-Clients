<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import Icon from '../Icon.vue'

const store = useDemoStore()
const router = useRouter()
const query = ref('')
const input = ref<HTMLInputElement | null>(null)
const routes = [
  { path: '/overview', title: 'Overview', icon: 'dashboard' },
  { path: '/infrastructure', title: 'Infrastructure', icon: 'server' },
  { path: '/artifacts', title: 'Artifacts', icon: 'package' },
  { path: '/releases', title: 'Releases', icon: 'layers' },
  { path: '/approvals', title: 'Approvals', icon: 'shield' },
  { path: '/deployments', title: 'Deployments', icon: 'rocket' },
  { path: '/connections', title: 'Connections', icon: 'plug' },
  { path: '/audit', title: 'Audit log', icon: 'audit' },
  { path: '/settings', title: 'Settings', icon: 'settings' },
]
const filteredRoutes = computed(() => routes.filter((item) => item.title.toLowerCase().includes(query.value.trim().toLowerCase())))
watch(() => store.commandOpen, async (open) => {
  if (open) { query.value = ''; await nextTick(); input.value?.focus() }
})
function navigate(path: string) {
  store.commandOpen = false
  void router.push(path)
}
</script>

<template>
  <div v-if="store.commandOpen" class="command-backdrop" @click.self="store.commandOpen = false">
    <section class="command-box" role="dialog" aria-modal="true" aria-labelledby="command-label">
      <div class="command-input"><Icon name="search" /><label id="command-label" class="visually-hidden">Search screens</label><input ref="input" v-model="query" placeholder="Go to a screen..." aria-label="Search screens" /><kbd>ESC</kbd></div>
      <div class="command-results" role="listbox" aria-label="Matching screens">
        <div class="command-category">GO TO</div>
        <button v-for="item in filteredRoutes" :key="item.path" class="command-result" type="button" role="option" :aria-selected="false" @click="navigate(item.path)"><Icon :name="item.icon" /><span>{{ item.title }}</span><small>Open screen <Icon name="arrowRight" /></small></button>
        <div v-if="!filteredRoutes.length" class="empty"><Icon name="search" /><h3>No screens found</h3><p>Try a different search.</p></div>
      </div>
    </section>
  </div>
</template>
