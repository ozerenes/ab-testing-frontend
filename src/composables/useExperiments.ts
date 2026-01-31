import { ref, type Ref } from 'vue'
import { experimentsApi } from '../api'
import type { Experiment } from '../api'

export function useExperiments() {
  const experiments: Ref<Experiment[]> = ref([])
  const loading = ref(true)
  const error = ref<string | null>(null)

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

  return {
    experiments,
    loading,
    error,
    fetchExperiments,
    retry,
  }
}
