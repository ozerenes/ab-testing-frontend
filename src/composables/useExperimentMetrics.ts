import { ref, watch, type Ref } from 'vue'
import { experimentsApi } from '../api'
import type { ExperimentStats } from '../api'

export function useExperimentMetrics(experimentId: Ref<string> | (() => string)) {
  const stats = ref<ExperimentStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getId(): string {
    return typeof experimentId === 'function' ? experimentId() : experimentId.value
  }

  async function fetchStats() {
    const id = getId()
    if (!id) return
    loading.value = true
    error.value = null
    try {
      stats.value = await experimentsApi.getStats(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load metrics'
    } finally {
      loading.value = false
    }
  }

  if (typeof experimentId === 'object' && experimentId !== null && 'value' in experimentId) {
    watch(experimentId, fetchStats, { immediate: false })
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}
