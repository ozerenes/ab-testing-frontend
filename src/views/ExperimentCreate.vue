<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ExperimentForm from '../components/ExperimentForm.vue'
import { experimentsApi } from '../api'
import type { CreateExperimentPayload } from '../api'

const router = useRouter()
const error = ref<string | null>(null)

async function handleSubmit(payload: CreateExperimentPayload) {
  error.value = null
  try {
    await experimentsApi.create(payload)
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create experiment'
  }
}

function handleCancel() {
  router.push('/')
}
</script>

<template>
  <div class="experiment-create">
    <header class="page-header">
      <h1>Create New Experiment</h1>
      <p class="subtitle">Set up a new A/B test experiment</p>
    </header>

    <div v-if="error" class="error-banner">
      <span class="error-icon">!</span>
      <span>{{ error }}</span>
    </div>

    <ExperimentForm @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.experiment-create {
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

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 6px;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 50%;
  flex-shrink: 0;
}

@media (prefers-color-scheme: light) {
  .page-header h1 {
    color: #213547;
  }

  .subtitle {
    color: rgba(0, 0, 0, 0.5);
  }
}
</style>
