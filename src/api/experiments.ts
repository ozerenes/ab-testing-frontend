import { apiClient } from './client'
import type {
  Experiment,
  CreateExperimentPayload,
  UpdateExperimentPayload,
  ExperimentStats,
} from './types'

const ENDPOINT = '/experiments'

export const experimentsApi = {
  getAll(): Promise<Experiment[]> {
    return apiClient.get(ENDPOINT).then((res) => res.data.data ?? [])
  },

  getById(id: string): Promise<Experiment> {
    return apiClient.get(`${ENDPOINT}/${id}`).then((res) => res.data.data ?? res.data)
  },

  create(payload: CreateExperimentPayload): Promise<Experiment> {
    return apiClient.post(ENDPOINT, payload).then((res) => res.data.data ?? res.data)
  },

  update(id: string, payload: UpdateExperimentPayload): Promise<Experiment> {
    return apiClient.patch(`${ENDPOINT}/${id}`, payload).then((res) => res.data.data ?? res.data)
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINT}/${id}`).then(() => undefined)
  },

  getStats(id: string): Promise<ExperimentStats> {
    return apiClient.get(`${ENDPOINT}/${id}/stats`).then((res) => res.data.data ?? res.data)
  },
}
