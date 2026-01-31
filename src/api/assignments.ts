import { apiClient } from './client'
import type { Assignment } from './types'

export const assignmentsApi = {
  get(experimentId: string, userId: string): Promise<Assignment | null> {
    return apiClient
      .get(`/assignments/${experimentId}/users/${userId}`)
      .then((res) => res.data.data ?? res.data)
      .catch((err) => (err.response?.status === 404 ? null : Promise.reject(err)))
  },

  assign(experimentId: string, userId: string): Promise<Assignment> {
    return apiClient
      .post(`/assignments/${experimentId}/users/${userId}`)
      .then((res) => res.data.data ?? res.data)
  },
}
