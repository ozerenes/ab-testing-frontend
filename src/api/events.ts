import { apiClient } from './client'
import type { Event, TrackEventPayload, EventsListParams, ApiListResponse } from './types'

const ENDPOINT = '/events'

export const eventsApi = {
  track(payload: TrackEventPayload): Promise<Event> {
    return apiClient.post(ENDPOINT, payload).then((res) => res.data)
  },

  list(params?: EventsListParams): Promise<ApiListResponse<Event>> {
    return apiClient.get(ENDPOINT, { params }).then((res) => res.data)
  },

  getById(id: string): Promise<Event> {
    return apiClient.get(`${ENDPOINT}/${id}`).then((res) => res.data)
  },

  getByExperimentId(experimentId: string): Promise<Event[]> {
    return eventsApi.list({ experimentId, limit: 1000 }).then((res) => res.data)
  },
}
