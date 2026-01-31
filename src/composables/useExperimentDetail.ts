import { ref, watch, type Ref } from 'vue'
import { experimentsApi } from '../api'
import type { Experiment, ExperimentStats } from '../api'

export function useExperimentDetail(experimentId: Ref<string> | (() => string)) {
  const experiment = ref<Experiment | null>(null)
  const stats = ref<ExperimentStats | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  function getId(): string {
    return typeof experimentId === 'function' ? experimentId() : experimentId.value
  }

  async function fetchExperiment() {
    const id = getId()
    if (!id) return
    loading.value = true
    error.value = null
    try {
      const [exp, st] = await Promise.all([
        experimentsApi.getById(id),
        experimentsApi.getStats(id),
      ])
      experiment.value = exp
      stats.value = st
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load experiment'
    } finally {
      loading.value = false
    }
  }

  if (typeof experimentId === 'object' && experimentId !== null && 'value' in experimentId) {
    watch(experimentId, fetchExperiment, { immediate: false })
  }

  return {
    experiment,
    stats,
    loading,
    error,
    fetchExperiment,
  }
}
