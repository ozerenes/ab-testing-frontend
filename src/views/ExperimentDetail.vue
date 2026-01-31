<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { experimentsApi, assignmentsApi } from '../api'
import type { Experiment, ExperimentStats, Assignment } from '../api'

const route = useRoute()
const router = useRouter()

const experiment = ref<Experiment | null>(null)
const stats = ref<ExperimentStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const assignment = ref<Assignment | null>(null)
const currentUserId = ref<string | null>(null)
const assignLoading = ref(false)
const assignError = ref<string | null>(null)

const experimentId = computed(() => String(route.params.id))

const statusColors: Record<Experiment['status'], string> = {
  draft: 'status-draft',
  active: 'status-active',
  paused: 'status-paused',
  completed: 'status-completed',
}

const statusLabels: Record<Experiment['status'], string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function fetchExperiment() {
  if (!experimentId.value) return
  loading.value = true
  error.value = null
  try {
    const [exp, st] = await Promise.all([
      experimentsApi.getById(experimentId.value),
      experimentsApi.getStats(experimentId.value),
    ])
    experiment.value = exp
    stats.value = st
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load experiment'
  } finally {
    loading.value = false
  }
}

function getVariantKey(v: { key?: string; name?: string }) {
  return v.key ?? v.name ?? '—'
}

function navigateBack() {
  router.push('/')
}

function generateRandomUserId(): string {
  const prefix = 'user-'
  const suffix = Math.random().toString(36).slice(2, 10)
  return `${prefix}${suffix}`
}

async function simulateUserAssignment() {
  if (!experimentId.value || !experiment.value?.variants?.length) return
  assignLoading.value = true
  assignError.value = null
  assignment.value = null
  const userId = generateRandomUserId()
  currentUserId.value = userId
  try {
    const result = await assignmentsApi.assign(experimentId.value, userId)
    assignment.value = result
  } catch (err) {
    assignError.value = err instanceof Error ? err.message : 'Failed to assign variant'
  } finally {
    assignLoading.value = false
  }
}

watch(experimentId, fetchExperiment, { immediate: false })
onMounted(fetchExperiment)
</script>

<template>
  <div class="experiment-detail">
    <header class="page-header">
      <button type="button" class="btn-back" aria-label="Back to experiments" @click="navigateBack">
        ← Back
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner" aria-hidden="true" />
      <p>Loading experiment...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button type="button" class="retry-btn" @click="fetchExperiment">Try again</button>
    </div>

    <template v-else-if="experiment">
      <section class="experiment-info">
        <div class="info-header">
          <h1 class="experiment-name">{{ experiment.name }}</h1>
          <span
            class="status-badge"
            :class="statusColors[experiment.status]"
            :title="statusLabels[experiment.status]"
          >
            {{ statusLabels[experiment.status] }}
          </span>
        </div>
        <p v-if="experiment.description" class="experiment-description">
          {{ experiment.description }}
        </p>
        <div class="experiment-meta">
          <span class="meta-item">
            <span class="meta-label">Start</span>
            {{ formatDate(experiment.startDate) }}
          </span>
          <span class="meta-item">
            <span class="meta-label">End</span>
            {{ formatDate(experiment.endDate) }}
          </span>
        </div>
      </section>

      <section class="assignment-section">
        <h2 class="section-title">User assignment simulation</h2>
        <p class="section-desc">
          Generate a random userId and assign a variant (deterministic: same user always gets same variant).
        </p>
        <div class="assignment-actions">
          <button
            type="button"
            class="btn-simulate"
            :disabled="assignLoading || !experiment.variants?.length"
            @click="simulateUserAssignment"
          >
            {{ assignLoading ? 'Assigning…' : 'Generate random user & assign variant' }}
          </button>
        </div>
        <div v-if="assignError" class="assign-error">{{ assignError }}</div>
        <div v-else-if="assignment" class="assignment-result">
          <span class="result-label">User:</span>
          <code class="result-user">{{ currentUserId }}</code>
          <span class="result-label">Assigned variant:</span>
          <strong class="result-variant">{{ assignment.variantKey }}</strong>
        </div>
      </section>

      <section class="variants-section">
        <h2 class="section-title">Variants</h2>
        <ul class="variants-list">
          <li
            v-for="v in experiment.variants"
            :key="getVariantKey(v)"
            class="variant-card"
          >
            <span class="variant-key">{{ getVariantKey(v) }}</span>
            <span v-if="v.weight != null" class="variant-weight">Weight: {{ v.weight }}%</span>
          </li>
        </ul>
      </section>

      <section v-if="stats" class="metrics-section">
        <h2 class="section-title">Metrics</h2>
        <div class="totals-row">
          <span class="metric">Views: {{ stats.totals.views }}</span>
          <span class="metric">Clicks: {{ stats.totals.clicks }}</span>
          <span class="metric">Conversions: {{ stats.totals.conversions }}</span>
          <span class="metric">Conversion rate: {{ stats.totals.conversionRate }}%</span>
        </div>
        <div class="variant-metrics">
          <div
            v-for="v in stats.variants"
            :key="v.variantKey"
            class="variant-metric-row"
          >
            <span class="variant-label">{{ v.variantKey }}</span>
            <span class="variant-stats">
              {{ v.views }} views · {{ v.clicks }} clicks · {{ v.conversions }} conversions
              ({{ v.conversionRate }}%)
            </span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.experiment-detail {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.btn-back {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--color-muted, rgba(255, 255, 255, 0.7));
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.btn-back:hover {
  color: #646cff;
  border-color: #646cff;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  gap: 1rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.6));
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #646cff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: rgba(255, 255, 255, 0.9);
}

.retry-btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 6px;
}

.retry-btn:hover {
  background: #535bf2;
}

.experiment-info {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.experiment-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-radius: 4px;
}

.status-draft {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.status-active {
  background: rgba(76, 175, 80, 0.25);
  color: #81c784;
}

.status-paused {
  background: rgba(255, 193, 7, 0.25);
  color: #ffca28;
}

.status-completed {
  background: rgba(158, 158, 158, 0.25);
  color: #bdbdbd;
}

.experiment-description {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.7));
  line-height: 1.5;
}

.experiment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.6));
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.meta-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.section-desc {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.6));
  line-height: 1.5;
}

.assignment-section {
  margin-bottom: 2rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.assignment-actions {
  margin-bottom: 1rem;
}

.btn-simulate {
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: white;
  background: #646cff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-simulate:hover:not(:disabled) {
  background: #535bf2;
}

.btn-simulate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.assign-error {
  font-size: 0.9rem;
  color: #ff6b6b;
  margin-bottom: 0.5rem;
}

.assignment-result {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.8));
}

.result-label {
  font-weight: 500;
}

.result-user {
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.85rem;
}

.result-variant {
  color: #81c784;
}

.variants-section {
  margin-bottom: 2rem;
}

.variants-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.variant-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-key {
  font-weight: 500;
}

.variant-weight {
  font-size: 0.85rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.6));
}

.metrics-section {
  padding-top: 1rem;
}

.totals-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.8));
}

.metric {
  font-weight: 500;
}

.variant-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variant-metric-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: 0.85rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.7));
}

.variant-label {
  font-weight: 500;
  min-width: 100px;
}

.variant-stats {
  flex: 1;
}

@media (prefers-color-scheme: light) {
  .btn-back {
    color: rgba(0, 0, 0, 0.6);
    border-color: rgba(0, 0, 0, 0.15);
  }

  .btn-back:hover {
    color: #535bf2;
    border-color: #535bf2;
  }

  .experiment-name {
    color: #213547;
  }

  .assignment-section {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .section-desc {
    color: rgba(0, 0, 0, 0.5);
  }

  .assignment-result {
    color: rgba(0, 0, 0, 0.7);
  }

  .result-user {
    background: rgba(0, 0, 0, 0.06);
  }

  .result-variant {
    color: #2e7d32;
  }

  .variant-card {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .totals-row,
  .variant-metric-row {
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>
