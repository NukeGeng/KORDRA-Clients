<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import Topbar from './components/layout/Topbar.vue'
import InspectorDrawer from './components/inspector/InspectorDrawer.vue'
import AppDialog from './components/feedback/AppDialog.vue'
import CommandPalette from './components/feedback/CommandPalette.vue'
import ToastNotice from './components/feedback/ToastNotice.vue'
import Icon from './components/Icon.vue'
import { useDemoStore } from './stores/demo'

const store = useDemoStore()
const route = useRoute()
const title = computed(() => String(route.meta.title ?? 'Overview'))
let toastTimer: number | undefined
function openAbout() { store.openDialog({ type: 'about' }) }
function openCommand() {
  if (store.dialog) return
  store.closeInspector()
  store.commandOpen = true
}
function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (store.commandOpen) store.commandOpen = false
    else openCommand()
    return
  }
  if (event.key === 'Escape') {
    if (store.dialog) store.closeDialog()
    else if (store.selected) store.closeInspector()
    else if (store.commandOpen) store.commandOpen = false
    else store.mobileNavOpen = false
    return
  }
  if (event.key === 'Tab') {
    const overlay = document.querySelector<HTMLElement>('.dialog-box')
      ?? document.querySelector<HTMLElement>('.command-box')
      ?? document.querySelector<HTMLElement>('.inspector')
      ?? (store.mobileNavOpen ? document.querySelector<HTMLElement>('.sidebar.open') : null)
    if (!overlay) return
    const focusable = [...overlay.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => element.getClientRects().length > 0)
    if (!focusable.length) return
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
      event.preventDefault(); first.focus()
    }
  }
}

watch(() => route.path, () => {
  store.resetFilters()
  store.closeInspector()
  store.closeDialog()
  store.commandOpen = false
  store.mobileNavOpen = false
})
watch(() => store.toastMessage, (message) => {
  if (toastTimer) window.clearTimeout(toastTimer)
  if (message) toastTimer = window.setTimeout(store.clearToast, 4200)
})
watch(() => Boolean(store.dialog || store.selected || store.commandOpen), (locked) => {
  document.body.style.overflow = locked ? 'hidden' : ''
})
watch(() => store.mobileNavOpen, async (open) => {
  await nextTick()
  if (open) document.querySelector<HTMLAnchorElement>('.sidebar.open .nav-link')?.focus()
  else if (document.activeElement instanceof HTMLElement && document.querySelector('.sidebar')?.contains(document.activeElement)) {
    document.getElementById('menu-toggle')?.focus()
  }
})
onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  if (toastTimer) window.clearTimeout(toastTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="app-shell" :class="{ compact: store.compact }">
    <AppSidebar :mobile-open="store.mobileNavOpen" @close="store.mobileNavOpen = false" @about="openAbout" />
    <button v-if="store.mobileNavOpen" class="scrim" type="button" aria-label="Close navigation" @click="store.mobileNavOpen = false" />
    <div class="app-body">
      <Topbar :title="title" :mobile-open="store.mobileNavOpen" @search="openCommand" @menu="store.mobileNavOpen = !store.mobileNavOpen" @about="openAbout" />
      <div class="preview-banner" role="status"><Icon name="flask" :size="14" /><span><b>Design preview</b> — All environments, resources, releases and activity below are synthetic. No connection to real infrastructure.</span><button class="preview-info" type="button" @click="openAbout">About preview <Icon name="arrowUpRight" :size="12" /></button></div>
      <main id="main" class="main" tabindex="-1"><RouterView /></main>
    </div>
    <InspectorDrawer />
    <AppDialog />
    <CommandPalette />
    <ToastNotice />
  </div>
</template>
