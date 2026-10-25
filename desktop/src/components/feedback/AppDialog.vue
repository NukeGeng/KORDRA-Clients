<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../../stores/demo'
import Icon from '../Icon.vue'

const store = useDemoStore()
const router = useRouter()
const name = ref('')
const artifactId = ref('')
const releaseForm = ref<HTMLFormElement | null>(null)
const dialog = computed(() => store.dialog)
const artifactRows = computed(() => store.data.artifacts.filter((row) => row.environment === store.environment))
const dialogId = computed(() => dialog.value && 'id' in dialog.value ? dialog.value.id : null)
const release = computed(() => dialog.value?.type === 'approve' || dialog.value?.type === 'reject' || dialog.value?.type === 'deploy'
  ? store.data.releases.find((row) => row.id === dialogId.value) ?? null
  : null)
const deployment = computed(() => dialog.value?.type === 'rollback'
  ? store.data.deployments.find((row) => row.id === dialogId.value) ?? null
  : null)

watch(dialog, async (value) => {
  if (value?.type === 'release') {
    name.value = `New ${store.environment} release`
    artifactId.value = artifactRows.value[0]?.id ?? ''
  }
  if (value) {
    await nextTick()
    const nameInput = document.querySelector<HTMLInputElement>('#release-name')
    if (nameInput) nameInput.focus()
    else document.querySelector<HTMLButtonElement>('.dialog-box .dialog-actions button:last-child')?.focus()
  }
}, { immediate: true })

const title = computed(() => {
  switch (dialog.value?.type) {
    case 'release': return 'Create a sample release'
    case 'approve': return 'Approve sample release?'
    case 'reject': return 'Reject sample release?'
    case 'deploy': return 'Simulate deployment operation?'
    case 'rollback': return 'Preview rollback request?'
    case 'reset': return 'Reset sample data?'
    case 'connectionGuide': return 'Connection setup is not available'
    case 'about': return 'About this local preview'
    default: return ''
  }
})
const description = computed(() => {
  switch (dialog.value?.type) {
    case 'release': return 'This creates a synthetic draft in the current preview only. A real release must bind an immutable artifact and an authorized target.'
    case 'approve':
    case 'reject': return release.value ? `${release.value.id} · ${release.value.name}. This changes the preview queue and demo audit trail only. No backend authorization is requested.` : 'This sample request is no longer available.'
    case 'deploy': return release.value ? 'A sample deployment record will be created locally. This does not run Helm, Kubernetes or any infrastructure command.' : 'This sample release is no longer available.'
    case 'rollback': return 'Rollback is a separately authorized operation in KORDRA. Here, only a synthetic audit entry is added. No cluster state is changed.'
    case 'reset': return 'Clear locally created drafts, approval changes and sample history edits. The original synthetic dataset will be restored.'
    case 'connectionGuide': return 'Read-only Kubernetes/Helm access will require approved target identity, credential references, tenant-scoped authorization and a Product API adapter. This preview does not ask for kubeconfig, tokens or secrets.'
    case 'about': return 'This desktop template runs entirely inside your device. All identities, health values, approvals and audit events are synthetic; nothing is connected, submitted or persisted.'
    default: return ''
  }
})
const affirm = computed(() => {
  switch (dialog.value?.type) {
    case 'release': return 'Create demo draft'
    case 'approve': return 'Approve in preview'
    case 'reject': return 'Reject in preview'
    case 'deploy': return 'Create sample run'
    case 'rollback': return 'Record sample request'
    case 'reset': return 'Reset preview'
    case 'connectionGuide': return 'Understood'
    case 'about': return 'Close'
    default: return 'Continue'
  }
})
const isDanger = computed(() => ['reject', 'rollback', 'reset'].includes(dialog.value?.type ?? ''))
const isCreate = computed(() => dialog.value?.type === 'release')

function confirm() {
  const current = store.dialog
  if (!current) return
  if (current.type === 'release') {
    if (!releaseForm.value?.reportValidity()) return
    const created = store.createRelease(name.value, artifactId.value)
    if (!created) {
      store.setToast('Select a sample artifact and enter a release name up to 70 characters.')
      return
    }
    store.closeDialog()
    store.setToast('Sample draft created. No real release was submitted.')
    void router.push('/releases').then(() => store.openInspector('release', created.id))
    return
  }
  if (current.type === 'approve' || current.type === 'reject') {
    const decision = current.type === 'approve' ? 'Approved' : 'Rejected'
    if (!store.decideRelease(current.id, decision)) {
      store.setToast('This sample request is no longer pending.')
      store.closeDialog()
      return
    }
    store.closeDialog()
    store.setToast(`Demo release ${decision.toLowerCase()} locally.`)
    return
  }
  if (current.type === 'deploy') {
    const created = store.previewDeployment(current.id)
    if (!created) { store.setToast('Only an approved sample release can start a preview.'); store.closeDialog(); return }
    store.closeDialog()
    store.setToast('Sample deployment run created. No real deployment was started.')
    void router.push('/deployments').then(() => store.openInspector('deployment', created.id))
    return
  }
  if (current.type === 'rollback') {
    if (store.recordRollback(current.id)) store.setToast('Sample rollback request recorded locally. No operation executed.')
    else store.setToast('This sample deployment is not eligible for a rollback preview.')
  }
  if (current.type === 'reset') {
    store.resetDemo()
    store.setToast('Preview sample data restored.')
  }
  store.closeDialog()
}
</script>

<template>
  <div v-if="dialog" class="dialog-backdrop" @click.self="store.closeDialog()">
    <section class="dialog-box" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div class="dialog-inner">
        <div class="dialog-top">
          <span class="icon"><Icon :name="isDanger ? 'alert' : isCreate ? 'plus' : 'info'" /></span>
          <button class="icon-button" type="button" aria-label="Close dialog" @click="store.closeDialog()"><Icon name="close" /></button>
        </div>
        <h2 id="dialog-title">{{ title }}</h2>
        <p id="dialog-description">{{ description }}</p>
        <form v-if="isCreate" ref="releaseForm" @submit.prevent="confirm">
          <div class="form-group"><label for="release-name">Release name</label><input id="release-name" v-model="name" required maxlength="70" autocomplete="off" /></div>
          <div class="form-group"><label for="release-artifact">Immutable artifact</label><select id="release-artifact" v-model="artifactId" required :disabled="!artifactRows.length"><option v-for="artifact in artifactRows" :key="artifact.id" :value="artifact.id">{{ artifact.tag }} · {{ artifact.digest }}</option></select><small v-if="!artifactRows.length">No synthetic artifacts in {{ store.environment }}.</small></div>
          <small>Preview-only draft; no approval or execution is implied.</small>
        </form>
        <div v-if="dialog.type === 'approve' || dialog.type === 'reject'" class="dialog-context"><b>{{ release?.name }}</b><span>{{ release?.version }} · {{ release?.environment }}</span></div>
        <div v-if="dialog.type === 'deploy'" class="dialog-context"><b>{{ release?.name }}</b><span>{{ release?.version }} · {{ release?.environment }}</span></div>
        <div v-if="dialog.type === 'rollback'" class="dialog-context"><b>{{ deployment?.name }}</b><span>{{ deployment?.version }} · {{ deployment?.environment }}</span></div>
      </div>
      <div class="dialog-actions">
        <button v-if="isCreate || !['about', 'connectionGuide'].includes(dialog.type)" class="btn" type="button" @click="store.closeDialog()">Cancel</button>
        <button class="btn" :class="{ 'btn-primary': !isDanger, 'btn-danger': isDanger }" type="button" :disabled="isCreate && !artifactRows.length" @click="confirm">{{ affirm }}</button>
      </div>
    </section>
  </div>
</template>
