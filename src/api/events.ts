import { apiClient } from './client'
import type { Event, TrackEventPayload } from './types'

const ENDPOINT = '/events'

export const eventsApi = {
  track(payload: TrackEventPayload): Promise<Event> {
    return apiClient.post(ENDPOINT, payload).then((res) => res.data.data ?? res.data)
  },
}
