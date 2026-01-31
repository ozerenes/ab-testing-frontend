<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { experimentsApi } from '../api'
import type { Experiment } from '../api'

const router = useRouter()

const experiments = ref<Experiment[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

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

async function fetchExperiments() {
  loading.value = true
  error.value = null
  try {
    experiments.value = await experimentsApi.getAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load experiments'
  } finally {
    loading.value = false
  }
}

function retry() {
  fetchExperiments()
}

function navigateToCreate() {
  router.push('/experiments/create')
}

function navigateToExperiment(id: string) {
  router.push(`/experiments/${id}`)
}

onMounted(() => {
  fetchExperiments()
})
</script>

<template>
  <div class="experiment-list">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1>Experiments</h1>
          <p class="subtitle">Manage your A/B tests and experiments</p>
        </div>
        <button type="button" class="btn-create" @click="navigateToCreate">+ New Experiment</button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner" aria-hidden="true" />
      <p>Loading experiments...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon" aria-hidden="true">!</div>
      <p class="error-message">{{ error }}</p>
      <button type="button" class="retry-btn" @click="retry">Try again</button>
    </div>

    <div v-else-if="experiments.length === 0" class="empty-state">
      <p class="empty-title">No experiments yet</p>
      <p class="empty-description">Create your first experiment to start A/B testing.</p>
    </div>

    <ul v-else class="experiment-grid">
      <li
        v-for="experiment in experiments"
        :key="experiment.id"
        class="experiment-card"
        role="button"
        tabindex="0"
        @click="navigateToExperiment(experiment.id)"
        @keydown.enter="navigateToExperiment(experiment.id)"
        @keydown.space.prevent="navigateToExperiment(experiment.id)"
      >
        <div class="card-header">
          <h2 class="experiment-name">{{ experiment.name }}</h2>
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
        <div class="card-meta">
          <span class="meta-item">
            <span class="meta-label">Variants</span>
            {{ experiment.variants?.length ?? 0 }}
          </span>
          <span class="meta-item">
            <span class="meta-label">Start</span>
            {{ formatDate(experiment.startDate) }}
          </span>
          <span class="meta-item">
            <span class="meta-label">End</span>
            {{ formatDate(experiment.endDate) }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.experiment-list {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .page-header {
    margin-bottom: 2rem;
  }
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.page-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

@media (min-width: 640px) {
  .page-header h1 {
    font-size: 1.75rem;
  }
}

.subtitle {
  margin: 0;
  color: var(--color-muted, rgba(255, 255, 255, 0.6));
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .subtitle {
    font-size: 0.95rem;
  }
}

.btn-create {
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  color: white;
  background: #646cff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-create:hover {
  background: #535bf2;
}

@media (min-width: 640px) {
  .btn-create {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}

.loading-state,
.error-state,
.empty-state {
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

.error-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.15);
  border-radius: 50%;
}

.error-message {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
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

.empty-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.empty-description {
  font-size: 0.9rem;
  margin: 0;
}

.experiment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 640px) {
  .experiment-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }
}

.experiment-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

@media (min-width: 640px) {
  .experiment-card {
    padding: 1.25rem;
  }
}

.experiment-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

@media (min-width: 480px) {
  .card-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }
}

.experiment-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

@media (min-width: 640px) {
  .experiment-name {
    font-size: 1.1rem;
  }
}

.status-badge {
  flex-shrink: 0;
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
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.7));
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 640px) {
  .experiment-description {
    font-size: 0.9rem;
  }
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  font-size: 0.8rem;
  color: var(--color-muted, rgba(255, 255, 255, 0.6));
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (min-width: 640px) {
  .card-meta {
    gap: 1rem 1.5rem;
  }
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 60px;
}

.meta-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

@media (min-width: 640px) {
  .meta-label {
    font-size: 0.7rem;
  }
}

@media (prefers-color-scheme: light) {
  .subtitle,
  .loading-state,
  .error-state,
  .empty-state {
    color: rgba(0, 0, 0, 0.5);
  }

  .page-header h1 {
    color: #213547;
  }

  .experiment-card {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .experiment-card:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.12);
  }

  .experiment-name {
    color: #213547;
  }

  .status-draft {
    background: rgba(0, 0, 0, 0.08);
    color: #555;
  }

  .status-active {
    background: rgba(76, 175, 80, 0.15);
    color: #2e7d32;
  }

  .status-paused {
    background: rgba(255, 193, 7, 0.2);
    color: #f57f17;
  }

  .status-completed {
    background: rgba(0, 0, 0, 0.06);
    color: #666;
  }

  .experiment-description,
  .card-meta {
    color: rgba(0, 0, 0, 0.6);
  }

  .card-meta {
    border-top-color: rgba(0, 0, 0, 0.08);
  }
}
</style>
