<script setup lang="ts">
import { useDemoStore } from '../../stores/demo'
import ContextualToolbar from '../../components/toolbar/ContextualToolbar.vue'
import Icon from '../../components/Icon.vue'
const store = useDemoStore()
</script>

<template>
  <ContextualToolbar :environment="false" :search="false" :status-filter="false" :count="false">
    <button class="btn" type="button" @click="store.openDialog({ type: 'about' })"><Icon name="help" />About preview</button>
  </ContextualToolbar>
  <div class="two-column">
    <section class="soft-section">
      <h2>Interface preferences</h2><p>These settings affect this local preview session only.</p>
      <div class="settings-row"><div><b>Compact data tables</b><p>Reduce row padding to fit more operational data.</p></div><button class="toggle" :class="{ active: store.compact }" type="button" role="switch" :aria-checked="store.compact" aria-label="Compact data tables" @click="store.toggleCompact()" /></div>
      <div class="settings-row"><div><b>Reset sample dataset</b><p>Undo example approvals and releases created in this session.</p></div><button class="btn" type="button" @click="store.openDialog({ type: 'reset' })"><Icon name="refresh" />Reset preview</button></div>
    </section>
    <section class="soft-section">
      <h2>Product boundaries</h2><p>Safety and separation for this visual prototype.</p>
      <div class="detail-grid settings-boundaries">
        <div class="detail-pair"><label>Product API</label><span>Not connected</span></div>
        <div class="detail-pair"><label>Data source</label><span>Synthetic fixtures</span></div>
        <div class="detail-pair"><label>Credentials</label><span>Not requested</span></div>
        <div class="detail-pair"><label>Writes</label><span>Local state only</span></div>
      </div>
      <button class="btn" type="button" @click="store.openDialog({ type: 'about' })"><Icon name="info" />About preview</button>
    </section>
  </div>
</template>
