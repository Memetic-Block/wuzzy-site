import type { UbiQuery, RetryState, AnalyticsErrorResponse } from '@/types/analytics'
import appConfig from '@/app-config'
import { useAnalytics } from './analytics'

// Constants
const QUEUE_STORAGE_KEY = 'wuzzy_analytics_queue'
const RETRY_STATE_KEY = 'wuzzy_analytics_retry'
const MAX_QUEUE_SIZE = 1000
const MAX_RETRY_DELAY = 60000 // 60 seconds

/**
 * Analytics Queue Manager
 * Handles batching and persistence of analytics queries with exponential backoff retry logic
 */
export class AnalyticsQueue {
  private queue: UbiQuery[] = []
  private isInitialized = false
  private readonly batchSize = 10
  private readonly flushInterval = 30000 // 30 seconds
  private retryAttempts = 0
  private readonly maxRetries = 5
  private readonly baseDelay = 1000
  private flushTimer: number | null = null
  private retryTimer: number | null = null

  constructor() {
    // Set up page unload listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        try {
          this.flush()
        } catch (e) {
          console.debug('Analytics flush on beforeunload failed:', e)
        }
      })

      window.addEventListener('visibilitychange', () => {
        try {
          if (document.visibilityState === 'hidden') {
            this.flush()
          }
        } catch (e) {
          console.debug('Analytics flush on visibilitychange failed:', e)
        }
      })
    }
  }

  /**
   * Initialize queue - loads persisted data from localStorage
   */
  initialize(): void {
    if (this.isInitialized) return

    try {
      this.loadQueueFromStorage()
      this.loadRetryState()
      this.isInitialized = true

      // Reschedule pending retry if exists
      const retryState = this.getRetryState()
      if (retryState && retryState.nextRetryAt && retryState.nextRetryAt > Date.now()) {
        const delay = retryState.nextRetryAt - Date.now()
        this.retryTimer = window.setTimeout(() => this.flush(), delay)
      }
    } catch (e) {
      console.debug('Analytics queue initialization failed:', e)
      this.isInitialized = true // Continue anyway with empty queue
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        // Enforce max queue size, keep most recent
        this.queue = parsed.slice(-MAX_QUEUE_SIZE)
      }
    } catch (e) {
      console.debug('Failed to load analytics queue from storage:', e)
      this.queue = []
    }
  }

  /**
   * Load retry state from localStorage
   */
  private loadRetryState(): void {
    try {
      const stored = localStorage.getItem(RETRY_STATE_KEY)
      if (!stored) return

      const state: RetryState = JSON.parse(stored)
      this.retryAttempts = state.attempts || 0
    } catch (e) {
      console.debug('Failed to load retry state:', e)
      this.retryAttempts = 0
    }
  }

  /**
   * Get current retry state
   */
  private getRetryState(): RetryState | null {
    try {
      const stored = localStorage.getItem(RETRY_STATE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  }

  /**
   * Persist queue to localStorage with quota handling
   */
  private persistQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue))
    } catch (e) {
      // Handle QuotaExceededError by dropping oldest items
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.debug('localStorage quota exceeded, dropping oldest analytics items')
        const dropCount = Math.floor(this.queue.length * 0.1) || 1
        this.queue = this.queue.slice(dropCount)
        
        // Retry save
        try {
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue))
        } catch (retryError) {
          console.debug('Failed to persist analytics queue after cleanup:', retryError)
        }
      }
    }
  }

  /**
   * Persist retry state to localStorage
   */
  private persistRetryState(nextRetryAt?: number): void {
    try {
      const state: RetryState = {
        attempts: this.retryAttempts,
        nextRetryAt
      }
      localStorage.setItem(RETRY_STATE_KEY, JSON.stringify(state))
    } catch (e) {
      console.debug('Failed to persist retry state:', e)
    }
  }

  /**
   * Clear retry state
   */
  private clearRetryState(): void {
    try {
      localStorage.removeItem(RETRY_STATE_KEY)
      this.retryAttempts = 0
    } catch (e) {
      console.debug('Failed to clear retry state:', e)
    }
  }

  /**
   * Add query to the queue
   */
  add(queryData: UbiQuery): void {
    if (!this.isInitialized) {
      console.debug('Analytics queue not initialized, skipping add')
      return
    }

    try {
      this.queue.push(queryData)

      // Enforce max queue size, drop oldest
      if (this.queue.length > MAX_QUEUE_SIZE) {
        this.queue = this.queue.slice(-MAX_QUEUE_SIZE)
      }

      this.persistQueue()

      // Auto-flush if batch size reached
      if (this.queue.length >= this.batchSize) {
        this.flush()
      } else {
        this.scheduleFlush()
      }
    } catch (e) {
      console.debug('Failed to add to analytics queue:', e)
    }
  }

  /**
   * Schedule automatic flush
   */
  private scheduleFlush(): void {
    if (this.flushTimer !== null) return

    this.flushTimer = window.setTimeout(() => {
      this.flush()
    }, this.flushInterval)
  }

  /**
   * Flush queue to analytics API
   */
  flush(): void {
    // Clear scheduled flush timer
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    // Check if analytics API is configured
    if (!appConfig.analyticsApiUrl) {
      console.debug('Analytics API URL not configured, skipping flush')
      return
    }

    // Check if queue is empty
    if (this.queue.length === 0) {
      return
    }

    const queries = [...this.queue]
    const analyticsApiUrl = appConfig.analyticsApiUrl

    // Send batch request with error handling
    fetch(`${analyticsApiUrl}/analytics/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries }),
      keepalive: true
    })
      .then(async response => {
        if (response.ok) {
          // Success - clear queue and retry state
          this.queue = []
          this.clearRetryState()
          this.persistQueue()
          return
        }

        // Parse structured error response
        try {
          const errorData: AnalyticsErrorResponse = await response.json()
          
          // Session expired - renew and retry once
          if (errorData.action === 'REQUEST_NEW_SESSION' && errorData.errorCode === 'EXPIRED_SESSION') {
            console.warn('Analytics session expired, attempting renewal')
            
            // Use statically imported analytics composable
            try {
              const analytics = useAnalytics()
              
              // Extract wallet address from old client_id (format: client@version@session@wallet)
              const oldClientId = queries[0]?.client_id
              let walletAddress: string | null = null
              if (oldClientId) {
                const parts = oldClientId.split('@')
                if (parts.length === 4) {
                  walletAddress = parts[3]
                }
              }
              
              // Get new session
              await analytics.initializeSession(true) // force refresh
              
              // Re-associate wallet if it existed
              if (walletAddress) {
                await analytics.updateSessionWithWallet(walletAddress)
              }
              
              // Update client_id in ALL queued items (not just current batch)
              const newClientId = analytics.getClientId()
              if (newClientId) {
                this.queue = this.queue.map(q => ({ ...q, client_id: newClientId }))
                this.persistQueue()
                
                // Update current batch and retry once
                const updatedQueries = queries.map(q => ({ ...q, client_id: newClientId }))
                
                const retryResponse = await fetch(`${analyticsApiUrl}/analytics/batch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ queries: updatedQueries }),
                  keepalive: true
                })
                
                if (retryResponse.ok) {
                  this.queue = []
                  this.clearRetryState()
                  this.persistQueue()
                  return
                }
                
                // Retry failed with 401 again - fall through to exponential backoff
                if (retryResponse.status === 401) {
                  console.warn('Session renewal retry failed with 401, falling back to retry logic')
                  this.handleFlushFailure()
                  return
                }
              }
              
              // Session renewal succeeded but retry failed - use exponential backoff
              this.handleFlushFailure()
            } catch (renewError) {
              console.warn('Session renewal failed:', renewError)
              // Don't clear queue - fall back to retry logic
              this.handleFlushFailure()
            }
            return
          }
          
          // Validation error - drop batch, don't retry
          if (errorData.action === 'FIX_DATA') {
            console.error('Analytics validation error:', errorData.message)
            this.queue = []
            this.clearRetryState()
            this.persistQueue()
            return
          }
          
          // Service unavailable or other retriable errors
          if (errorData.action === 'RETRY_LATER' || errorData.retry === true) {
            this.handleFlushFailure()
            return
          }
          
          // Unknown error - use exponential backoff
          this.handleFlushFailure()
          
        } catch (parseError) {
          // If parsing fails, use exponential backoff
          this.handleFlushFailure()
        }
      })
      .catch(() => {
        // Network error - schedule retry
        this.handleFlushFailure()
      })
  }

  /**
   * Handle flush failure with exponential backoff
   */
  private handleFlushFailure(): void {
    this.retryAttempts++

    if (this.retryAttempts >= this.maxRetries) {
      // Max retries exceeded - drop batch and reset
      console.debug('Max analytics retry attempts exceeded, dropping batch')
      this.queue = []
      this.clearRetryState()
      this.persistQueue()
      return
    }

    // Calculate backoff delay with cap
    const backoff = Math.min(
      this.baseDelay * Math.pow(2, this.retryAttempts),
      MAX_RETRY_DELAY
    )

    const nextRetryAt = Date.now() + backoff
    this.persistRetryState(nextRetryAt)

    // Schedule retry
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer)
    }

    this.retryTimer = window.setTimeout(() => {
      this.flush()
    }, backoff)

    console.debug(`Analytics flush failed, retrying in ${backoff}ms (attempt ${this.retryAttempts}/${this.maxRetries})`)
  }

  /**
   * Clear the queue and retry state
   * Used when user wants to clear all analytics data
   */
  clear(): void {
    this.queue = []
    this.retryAttempts = 0
    this.clearRetryState()
    
    try {
      localStorage.removeItem(QUEUE_STORAGE_KEY)
    } catch (e) {
      console.debug('Failed to clear analytics queue from storage:', e)
    }
    
    // Clear any pending timers
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
  }
}

// Export singleton instance
export const analyticsQueue = new AnalyticsQueue()
