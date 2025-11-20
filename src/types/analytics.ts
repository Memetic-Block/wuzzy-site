/**
 * Analytics type definitions for OpenSearch UBI (User Behavior Insights) 1.3.0 specification
 */

/**
 * Application types for different search contexts
 */
export type ApplicationType = 'graphql-images' | 'graphql-audio' | 'graphql-video'

/**
 * UBI Query structure for tracking search queries
 */
export interface UbiQuery {
  application: string
  query_id: string
  client_id: string
  user_query: string
  timestamp: string
  query_response_hit_ids: string[]
  query_attributes?: Record<string, any>
}

/**
 * UBI Event structure for tracking user interactions
 * Note: query_id is required for linking events to queries
 */
export interface UBIEvent {
  action_name: string
  client_id: string
  query_id: string
  timestamp: string
  event_attributes: {
    object?: {
      object_id?: string
      object_id_field?: string
      description?: string
    }
    position?: {
      ordinal?: number
      x?: number
      y?: number
    }
  }
}

/**
 * Retry state for persistent queue recovery
 */
export interface RetryState {
  attempts: number
  nextRetryAt?: number
}

/**
 * Error codes returned by Analytics Goblin API
 */
export type ErrorCode = 
  | 'INVALID_SESSION'
  | 'EXPIRED_SESSION'
  | 'VALIDATION_ERROR'
  | 'INVALID_CLIENT_NAME'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'

/**
 * Actions recommended by the API for error handling
 */
export type ErrorAction = 
  | 'REQUEST_NEW_SESSION'
  | 'FIX_DATA'
  | 'RETRY_LATER'
  | 'CONTACT_SUPPORT'

/**
 * Structured error response from Analytics Goblin API
 */
export interface AnalyticsErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
  errorCode?: ErrorCode
  action?: ErrorAction
  retry?: boolean
}
