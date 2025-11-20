import { ref, readonly } from 'vue'
import appConfig from '../app-config'
import type { ApplicationType, UbiQuery, UBIEvent, AnalyticsErrorResponse } from '@/types/analytics'
import { analyticsQueue } from './analytics-queue'
import { useWallet } from './wallet'
import { useWalletAnalytics } from './wallet-analytics'

// Constants
const SESSION_STORAGE_KEY = 'wuzzy_analytics_session_id'
const CONSENT_STORAGE_KEY = 'wuzzy_analytics_consent'
const CLIENT_NAME = 'wuzzy-web'
const CLIENT_VERSION = appConfig.releaseTag === 'stage'
  ? '0.0.0-stage-'+appConfig.versionSha?.slice(0,7)
  : appConfig.releaseTag || 'unknown'

// Types
export interface SessionInitResponse {
  session_id: string
  client_id: string
  message?: string
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
   * Initialize analytics session from API
   */
  async function initializeSession(forceRefresh = false): Promise<string> {
    // Check if session already exists in localStorage (unless forcing refresh)
    if (!forceRefresh) {
      const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
      if (existingSessionId) {
        return existingSessionId
      }
    }

    // Request new session from Analytics Goblin
    const analyticsApiUrl = appConfig.analyticsApiUrl
    if (!analyticsApiUrl) {
      throw new Error('Analytics API URL not configured')
    }

    // Get wallet if connected
    const wallet = useWallet()

    const headers: Record<string, string> = {
      'X-Client-Name': CLIENT_NAME,
      'X-Client-Version': CLIENT_VERSION,
    }

    // Add wallet address if connected
    if (wallet.isConnected.value && wallet.address.value) {
      headers['X-Wallet-Address'] = wallet.address.value
    }

    const response = await fetch(
      `${analyticsApiUrl}/session/init`,
      {
        method: 'GET',
        headers,
      }
    )

    if (!response.ok) {
      try {
        const errorData: AnalyticsErrorResponse = await response.json()
        
        if (errorData.errorCode === 'RATE_LIMIT_EXCEEDED') {
          const retryAfter = response.headers.get('Retry-After')
          throw new Error(`Analytics rate limited. Retry after ${retryAfter} seconds`)
        }
        
        if (errorData.action === 'FIX_DATA') {
          throw new Error(`Session init validation error: ${JSON.stringify(errorData.message)}`)
        }
        
        throw new Error(`Session init failed: ${errorData.message || response.status}`)
      } catch (parseError) {
        // If error parsing fails, throw generic error
        throw new Error(`Session init failed: ${response.status}`)
      }
    }

    const data: SessionInitResponse = await response.json()
    
    // Store session ID in localStorage
    localStorage.setItem(SESSION_STORAGE_KEY, data.session_id)
    
    return data.session_id
  }

  /**
   * Initialize analytics (loads consent, creates session if accepted)
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    // Skip analytics if API not configured
    if (!appConfig.analyticsApiUrl) {
      console.warn('Analytics disabled: API URL not configured')
      isInitialized.value = true
      return
    }

    // Load consent status
    consentStatus.value = loadConsentStatus()

    // If user has accepted, initialize session and queue
    if (consentStatus.value === 'accepted') {
      try {
        sessionId.value = await initializeSession()
        analyticsQueue.initialize()
      } catch (e) {
        console.warn('Analytics initialization failed:', e)
      }
    }

    isInitialized.value = true
  }

  /**
   * User accepts analytics tracking
   */
  async function acceptConsent(): Promise<void> {
    saveConsentStatus('accepted')
    
    // Skip if API not configured
    if (!appConfig.analyticsApiUrl) {
      console.warn('Analytics disabled: API URL not configured')
      return
    }

    // Initialize session
    if (!sessionId.value) {
      try {
        sessionId.value = await initializeSession()
        analyticsQueue.initialize()
      } catch (e) {
        console.warn('Analytics initialization failed:', e)
      }
    }
  }

  /**
   * User declines analytics tracking
   */
  function declineConsent(): void {
    saveConsentStatus('declined')
    
    // Cascade decline to wallet analytics
    const walletAnalytics = useWalletAnalytics()
    walletAnalytics.declineWalletConsent()
    
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
    
    // Also clear wallet consent
    const walletAnalytics = useWalletAnalytics()
    walletAnalytics.clearWalletConsent()
  }

  /**
   * Build client_id for UBI tracking
   */
  function buildClientId(): string {
    if (!sessionId.value) {
      console.warn('Analytics session not initialized')
      return ''
    }
    
    // Get wallet if connected AND user has consented to wallet tracking
    const wallet = useWallet()
    const walletAnalytics = useWalletAnalytics()
    const walletSuffix = 
      wallet.address.value && walletAnalytics.hasWalletConsent(wallet.address.value)
        ? `@${wallet.address.value}`
        : ''
    
    return `${CLIENT_NAME}@${CLIENT_VERSION}@${sessionId.value}${walletSuffix}`
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
   * Generate unique query ID
   */
  function generateQueryId(): string {
    return crypto.randomUUID()
  }

  /**
   * Submit query to analytics
   */
  async function submitQuery(
    application: ApplicationType,
    userQuery: string,
    resultIds: string[],
    attributes?: Record<string, any>
  ): Promise<string> {
    const queryId = generateQueryId()

    // Don't track if user hasn't consented
    if (consentStatus.value !== 'accepted') {
      return queryId
    }

    try {
      // Ensure we have a valid session before submitting
      if (!sessionId.value) {
        sessionId.value = await initializeSession()
      }
      
      const clientId = getClientId()
      if (!clientId) return queryId

      // Get wallet if connected AND user has consented to wallet tracking
      const wallet = useWallet()
      const walletAnalytics = useWalletAnalytics()

      const queryData: UbiQuery = {
        application,
        query_id: queryId,
        client_id: clientId,
        user_query: userQuery,
        timestamp: new Date().toISOString(),
        query_response_hit_ids: resultIds,
        query_attributes: {
          ...attributes,
          ...(wallet.address.value && 
              walletAnalytics.hasWalletConsent(wallet.address.value) && 
              { wallet_address: wallet.address.value })
        }
      }

      analyticsQueue.add(queryData)
    } catch (e) {
      console.warn('Analytics query submission failed:', e)
    }

    return queryId
  }

  /**
   * Update session with wallet address
   */
  async function updateSessionWithWallet(walletAddress: string): Promise<void> {
    if (!sessionId.value) {
      console.warn('No analytics session to update with wallet')
      return
    }

    try {
      const analyticsApiUrl = appConfig.analyticsApiUrl
      if (!analyticsApiUrl) {
        console.warn('Analytics API URL not configured')
        return
      }

      const response = await fetch(
        `${analyticsApiUrl}/session/update`,
        {
          method: 'PUT',
          headers: {
            'X-Session-Id': sessionId.value,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: walletAddress
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.warn('Analytics session updated with wallet:', data)
      }
    } catch (e) {
      console.warn('Failed to update analytics session with wallet:', e)
    }
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
    console.warn('Analytics event:', {
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
    initializeSession,
    acceptConsent,
    declineConsent,
    clearSession,
    getClientId,
    generateQueryId,
    submitQuery,
    updateSessionWithWallet,
    trackEvent,
    
    // Computed
    hasConsent: () => consentStatus.value === 'accepted',
    needsConsent: () => consentStatus.value === 'pending',
  }
}
