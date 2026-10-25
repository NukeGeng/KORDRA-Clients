<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import { useDemoStore } from '../../stores/demo'
import StatusBadge from '../StatusBadge.vue'
import Icon from '../Icon.vue'

const store = useDemoStore()
const selected = computed(() => store.selected)
const record = computed(() => store.selectedRecord)
const pairs = computed(() => Object.entries(record.value ?? {}).filter(([key]) => !['id', 'steps', 'note'].includes(key)).slice(0, 12))
const displayName = computed(() => record.value?.name ?? record.value?.image ?? record.value?.id ?? 'Sample record')
const summary = computed(() => {
  if (selected.value?.type === 'artifact') return 'Image tags are mutable; the digest is the immutable release identity used by KORDRA.'
  if (selected.value?.type === 'release' || selected.value?.type === 'deployment') return record.value?.note ?? 'Sample metadata only.'
  if (selected.value?.type === 'resource') return 'Workload and replica readiness are example observations only.'
  if (selected.value?.type === 'audit') return 'This audit row was generated from synthetic or local preview activity.'
  return 'Sample metadata only. No provider read has taken place.'
})
const workflowSteps = ['Validate release', 'Submit to target', 'Wait for readiness', 'Verify observed state']

watch(selected, async (value) => {
  if (value) {
    await nextTick()
    document.querySelector<HTMLButtonElement>('.inspector [data-inspector-close]')?.focus()
  }
})

function label(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^\w/, (letter) => letter.toUpperCase())
}
function valueText(value: unknown) {
  return Array.isArray(value) ? value.join(', ') : String(value ?? '—')
}
function confirmAction(type: 'approve' | 'reject' | 'deploy' | 'rollback') {
  if (!selected.value) return
  if (type === 'approve' || type === 'reject') store.openDialog({ type, id: selected.value.id })
  else if (type === 'deploy') store.openDialog({ type, id: selected.value.id })
  else store.openDialog({ type, id: selected.value.id })
}
</script>

<template>
  <div v-if="selected && record" class="inspector-backdrop" @click.self="store.closeInspector()">
    <section class="inspector" role="dialog" aria-modal="true" aria-labelledby="inspector-name">
      <div class="inspector-head">
        <div><div class="hint">{{ selected.type }} / sample record</div><h2 id="inspector-name">{{ displayName }}</h2><p>{{ record.id }}<template v-if="record.environment"> · {{ record.environment }}</template></p></div>
        <button class="icon-button" data-inspector-close type="button" aria-label="Close details" @click="store.closeInspector()"><Icon name="close" /></button>
      </div>
      <div class="inspector-scroll">
        <div class="detail-summary">{{ summary }}</div>
        <div class="detail-title">Record details</div>
        <div class="detail-grid">
          <div v-for="[key, value] in pairs" :key="key" class="detail-pair"><label>{{ label(key) }}</label><span v-if="key === 'status' || key === 'result'"><StatusBadge :status="valueText(value)" /></span><span v-else>{{ valueText(value) }}</span></div>
        </div>
        <section v-if="selected.type === 'deployment'" class="detail-section">
          <div class="detail-title">Operation progress (sample)</div>
          <div v-for="(step, index) in workflowSteps" :key="step" class="history-step" :class="{ done: record.steps?.[index] === 'done', current: record.steps?.[index] === 'current' }">
            <span class="step-mark" /><div><b>{{ step }}</b><p>{{ record.steps?.[index] === 'done' ? 'Completed in sample timeline' : record.steps?.[index] === 'current' ? 'Step requiring attention' : 'Not yet confirmed' }}</p></div>
          </div>
        </section>
        <section v-if="selected.type === 'release'" class="detail-section"><div class="detail-title">Approval boundary</div><div class="detail-summary">The approved artifact digest and target cannot be silently changed after an actual approval. This sample action never reaches Product.</div></section>
      </div>
      <div class="inspector-footer">
        <button v-if="selected.type === 'release' && record.status === 'Pending'" class="btn btn-danger" type="button" @click="confirmAction('reject')">Reject preview</button>
        <button v-if="selected.type === 'release' && record.status === 'Pending'" class="btn btn-primary" type="button" @click="confirmAction('approve')">Approve preview</button>
        <button v-if="selected.type === 'release' && record.status === 'Approved'" class="btn btn-primary" type="button" @click="confirmAction('deploy')">Preview deploy</button>
        <button v-if="selected.type === 'deployment' && ['Running', 'Verifying'].includes(record.status ?? '')" class="btn btn-primary" type="button" @click="store.advanceDeployment(record.id); store.setToast('Sample deployment progress advanced locally.')">Advance sample progress</button>
        <button v-if="selected.type === 'deployment' && record.status === 'Verified'" class="btn btn-danger" type="button" @click="confirmAction('rollback')">Preview rollback</button>
        <button class="btn" type="button" @click="store.closeInspector()">Close details</button>
      </div>
    </section>
  </div>
</template>
