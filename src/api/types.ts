// Experiment types
export interface ExperimentVariant {
  id: string
  key?: string
  name: string
  weight?: number
  config?: Record<string, unknown>
}

export interface Experiment {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  variants: ExperimentVariant[]
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateExperimentVariantPayload {
  key: string
  name: string
  weight?: number
}

export interface CreateExperimentPayload {
  name: string
  description?: string
  variants: CreateExperimentVariantPayload[]
  startDate?: string
  endDate?: string
}

export interface UpdateExperimentPayload extends Partial<
  Omit<CreateExperimentPayload, 'variants'>
> {
  status?: Experiment['status']
  variants?: ExperimentVariant[]
}

// Event types (backend uses variantKey)
export interface TrackEventPayload {
  experimentId: string
  variantKey: string
  eventType: 'view' | 'click' | 'conversion'
  userId?: string
  sessionId?: string
  metadata?: Record<string, unknown>
}

export interface Event {
  id: string
  experimentId: string
  variantKey: string
  eventType: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, unknown>
  timestamp: string
  createdAt: string
}

// Assignment types
export interface Assignment {
  experimentId: string
  userId: string
  variantKey: string
  assignedAt: string
  variant?: { key: string; weight?: number }
}

// Experiment stats (GET /experiments/:id/stats)
export interface VariantStats {
  variantKey: string
  views: number
  clicks: number
  conversions: number
  conversionRate: number
}

export interface ExperimentStats {
  experimentId: string
  experimentName: string
  variants: VariantStats[]
  totals: {
    views: number
    clicks: number
    conversions: number
    conversionRate: number
  }
}

export interface EventsListParams {
  experimentId?: string
  variantId?: string
  eventType?: string
  userId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// API response wrapper
export interface ApiListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
