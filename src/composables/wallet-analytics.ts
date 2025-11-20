import { ref, computed } from 'vue'
import { useAnalytics } from './analytics'

const WALLET_CONSENT_STORAGE_KEY = 'wuzzy_wallet_consent'

export type WalletConsentStatus = 'pending' | 'accepted' | 'declined'

const consentStatus = ref<WalletConsentStatus>('pending')

export function useWalletAnalytics() {
  const analytics = useAnalytics()

  /**
   * Load wallet consent status from localStorage
   */
  function loadWalletConsentStatus() {
    try {
      const storedStatus = localStorage.getItem(WALLET_CONSENT_STORAGE_KEY) as WalletConsentStatus | null
      
      if (storedStatus) {
        consentStatus.value = storedStatus
      }
    } catch (error) {
      console.warn('Failed to load wallet consent status:', error)
    }
  }

  /**
   * Save wallet consent status to localStorage
   */
  function saveWalletConsentStatus(status: WalletConsentStatus) {
    try {
      console.log('Saving wallet consent status:', status)
      localStorage.setItem(WALLET_CONSENT_STORAGE_KEY, status)
      consentStatus.value = status
    } catch (error) {
      console.warn('Failed to save wallet consent status:', error)
    }
  }

  /**
   * User accepts wallet analytics tracking
   */
  function acceptWalletConsent(address: string) {
    // Can only accept if general analytics is accepted
    if (analytics.needsConsent()) {
      console.warn('Cannot accept wallet consent without general analytics consent')
      return
    }
    
    if (!address) {
      console.warn('Cannot accept wallet consent without wallet address')
      return
    }
    
    saveWalletConsentStatus('accepted')
    
    // Update the analytics session with wallet address
    analytics.updateSessionWithWallet(address)
  }

  /**
   * User declines wallet analytics tracking
   */
  function declineWalletConsent() {
    saveWalletConsentStatus('declined')
  }

  /**
   * Clear wallet consent status (for clearing all data)
   */
  function clearWalletConsent() {
    try {
      localStorage.removeItem(WALLET_CONSENT_STORAGE_KEY)
      consentStatus.value = 'pending'
    } catch (error) {
      console.warn('Failed to clear wallet consent:', error)
    }
  }

  /**
   * Check if wallet consent is needed
   * Returns true if:
   * - General analytics is accepted (dependency)
   * - Wallet is connected (address provided)
   * - No consent given yet
   */
  function needsWalletConsent(address: string | null): boolean {
    // Dependency: can't ask for wallet consent without general analytics
    if (analytics.needsConsent()) {
      console.log('Not showing wallet consent banner: general analytics consent pending or declined')
      return false
    }
    
    // Need wallet connected
    if (!address) {
      console.log('Not showing wallet consent banner: wallet not connected')
      return false
    }
    
    // No consent given yet
    if (consentStatus.value === 'pending') {
      console.log('Not showing wallet consent banner: no consent given yet')
      return true
    }
    
    console.log('Wallet consent already given:', consentStatus.value)
    return false
  }

  /**
   * Check if wallet analytics is enabled
   */
  function hasWalletConsent(address: string | null): boolean {
    return (
      !analytics.needsConsent() && // General analytics must be accepted
      !!address && // Wallet must be connected
      consentStatus.value === 'accepted'
    )
  }

  // Load consent status on composable initialization
  loadWalletConsentStatus()

  return {
    consentStatus: computed(() => consentStatus.value),
    needsWalletConsent,
    hasWalletConsent,
    acceptWalletConsent,
    declineWalletConsent,
    clearWalletConsent
  }
}
