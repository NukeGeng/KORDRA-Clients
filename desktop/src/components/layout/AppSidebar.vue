<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import Icon from '../Icon.vue'

defineProps<{ mobileOpen: boolean }>()
const emit = defineEmits<{ close: []; about: [] }>()
const store = useDemoStore()

const groups = [
  {
    label: 'OPERATIONS',
    routes: [
      { to: '/overview', title: 'Overview', icon: 'dashboard' },
      { to: '/infrastructure', title: 'Infrastructure', icon: 'server' },
      { to: '/artifacts', title: 'Artifacts', icon: 'package' },
      { to: '/releases', title: 'Releases', icon: 'layers' },
      { to: '/approvals', title: 'Approvals', icon: 'shield' },
      { to: '/deployments', title: 'Deployments', icon: 'rocket' },
    ],
  },
  {
    label: 'MANAGEMENT',
    routes: [
      { to: '/connections', title: 'Connections', icon: 'plug' },
      { to: '/audit', title: 'Audit log', icon: 'audit' },
      { to: '/settings', title: 'Settings', icon: 'settings' },
    ],
  },
]
</script>

<template>
  <div id="primary-navigation" class="sidebar" :class="{ open: mobileOpen }" :role="mobileOpen ? 'dialog' : 'complementary'" :aria-modal="mobileOpen ? 'true' : undefined" aria-label="Primary navigation">
    <RouterLink to="/overview" class="brand" @click="emit('close')">
      <span class="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span>
      <span class="brand-wordmark">KORDRA<span class="brand-subtitle">CONTROL PLANE</span></span>
    </RouterLink>

    <div class="workspace-area">
      <div class="minor-label">WORKSPACE</div>
      <button class="workspace-switch" type="button" @click="store.setToast('This preview includes one synthetic operator workspace.')">
        <span class="workspace-emblem">K</span>
        <span class="workspace-copy"><b>Operator workspace</b><small>Local design preview</small></span>
        <span class="workspace-chevron"><Icon name="chevrons" :size="13" /></span>
      </button>
    </div>

    <nav aria-label="Screens">
      <div v-for="group in groups" :key="group.label" class="nav-section">
        <div class="nav-heading">{{ group.label }}</div>
        <RouterLink
          v-for="route in group.routes"
          :key="route.to"
          :to="route.to"
          class="nav-link"
          active-class="active"
          @click="emit('close')"
        >
          <Icon :name="route.icon" />
          <span>{{ route.title }}</span>
          <span v-if="route.to === '/approvals' && store.pendingApprovalCount" class="nav-count">{{ store.pendingApprovalCount }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar-bottom">
      <button class="sidebar-preview" type="button" @click="emit('about')">
        <span class="preview-pulse" />
        <span><b>Preview environment</b><small>No backend connection</small></span>
      </button>
      <div class="sidebar-person">
        <div class="avatar">OP</div>
        <span><b>Demo operator</b><small>Local session</small></span>
        <Icon class="person-more" name="more" :size="17" />
      </div>
    </div>
  </div>
</template>
