import { ref, readonly } from 'vue'
import appConfig from '../app-config'

// Constants
const SESSION_STORAGE_KEY = 'wuzzy_analytics_session_id'
const CONSENT_STORAGE_KEY = 'wuzzy_analytics_consent'
const CLIENT_NAME = 'wuzzy-site'
const CLIENT_VERSION = '1.0.0'

// Types
export interface SessionInitResponse {
  session_id: string
  client_id: string
  message?: string
}

export interface UBIEvent {
  action_name: string
  client_id: string
  query_id?: string
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

export type ConsentStatus = 'pending' | 'accepted' | 'declined' | null

// Reactive state
const sessionId = ref<string | null>(null)
const consentStatus = ref<ConsentStatus>(null)
const isInitialized = ref(false)

/**
 * GDPR-compliant analytics composable
 * - No cookies (localStorage only)
 * - User consent required before tracking
 * - IP anonymization on backend
 * - Session data stored client-side only
 */
export function useAnalytics() {
  /**
   * Check if localStorage is available
   */
  function isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Load consent status from localStorage
   */
  function loadConsentStatus(): ConsentStatus {
    if (!isLocalStorageAvailable()) return null

    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored === 'accepted') return 'accepted'
    if (stored === 'declined') return 'declined'
    return 'pending'
  }

  /**
   * Save consent status to localStorage
   */
  function saveConsentStatus(status: 'accepted' | 'declined'): void {
    if (!isLocalStorageAvailable()) return

    localStorage.setItem(CONSENT_STORAGE_KEY, status)
    consentStatus.value = status
  }

  /**
   * Generate fallback session ID when API is unavailable
   */
  function generateFallbackSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `fallback-${timestamp}-${random}`
  }

  /**
   * Initialize analytics session from API
   */
  async function initializeSession(): Promise<string> {
    // Check if session already exists in localStorage
    const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
    if (existingSessionId) {
      return existingSessionId
    }

    // Request new session from Analytics Goblin
    try {
      const analyticsApiUrl = appConfig.analyticsApiUrl
      if (!analyticsApiUrl) {
        console.warn('Analytics API URL not configured, using fallback session')
        const fallbackId = generateFallbackSessionId()
        localStorage.setItem(SESSION_STORAGE_KEY, fallbackId)
        return fallbackId
      }

      const response = await fetch(
        `${analyticsApiUrl}/session/init?client_name=${CLIENT_NAME}&client_version=${CLIENT_VERSION}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          console.warn(`Analytics rate limited. Retry after ${retryAfter} seconds`)
        } else {
          console.warn(`Analytics session init failed: ${response.status}`)
        }
        throw new Error(`Session init failed: ${response.status}`)
      }

      const data: SessionInitResponse = await response.json()
      
      // Store session ID in localStorage
      localStorage.setItem(SESSION_STORAGE_KEY, data.session_id)
      
      return data.session_id
    } catch (error) {
      console.error('Failed to initialize analytics session:', error)
      // Generate fallback session ID (still track locally even if API fails)
      const fallbackId = generateFallbackSessionId()
      localStorage.setItem(SESSION_STORAGE_KEY, fallbackId)
      return fallbackId
    }
  }

  /**
   * Initialize analytics (loads consent, creates session if accepted)
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    // Load consent status
    consentStatus.value = loadConsentStatus()

    // If user has accepted, initialize session
    if (consentStatus.value === 'accepted') {
      sessionId.value = await initializeSession()
    }

    isInitialized.value = true
  }

  /**
   * User accepts analytics tracking
   */
  async function acceptConsent(): Promise<void> {
    saveConsentStatus('accepted')
    
    // Initialize session
    if (!sessionId.value) {
      sessionId.value = await initializeSession()
    }
  }

  /**
   * User declines analytics tracking
   */
  function declineConsent(): void {
    saveConsentStatus('declined')
    
    // Clear any existing session
    clearSession()
  }

  /**
   * Clear session and consent (e.g., on logout or user request)
   */
  function clearSession(): void {
    if (!isLocalStorageAvailable()) return

    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(CONSENT_STORAGE_KEY)
    sessionId.value = null
    consentStatus.value = 'pending'
  }

  /**
   * Build client_id for UBI tracking
   */
  function buildClientId(): string {
    if (!sessionId.value) {
      throw new Error('Analytics session not initialized')
    }
    return `${CLIENT_NAME}@${CLIENT_VERSION}@${sessionId.value}`
  }

  /**
   * Get current client_id (returns null if not consented)
   */
  function getClientId(): string | null {
    if (consentStatus.value !== 'accepted' || !sessionId.value) {
      return null
    }
    return buildClientId()
  }

  /**
   * Track UBI event (placeholder for future implementation)
   * Only tracks if user has consented
   */
  async function trackEvent(
    actionName: string,
    queryId?: string,
    attributes: UBIEvent['event_attributes'] = {}
  ): Promise<void> {
    // Don't track if user hasn't consented
    if (consentStatus.value !== 'accepted' || !sessionId.value) {
      return
    }

    // Note: Actual event tracking will be implemented in a later iteration
    // This is a placeholder for the Analytics Goblin integration
    console.debug('Analytics event:', {
      action_name: actionName,
      client_id: buildClientId(),
      query_id: queryId,
      timestamp: new Date().toISOString(),
      event_attributes: attributes,
    })
  }

  return {
    // State
    sessionId: readonly(sessionId),
    consentStatus: readonly(consentStatus),
    isInitialized: readonly(isInitialized),
    
    // Methods
    initialize,
    acceptConsent,
    declineConsent,
    clearSession,
    getClientId,
    trackEvent,
    
    // Computed
    hasConsent: () => consentStatus.value === 'accepted',
    needsConsent: () => consentStatus.value === 'pending',
  }
}
