import { computed, ref } from 'vue'
import type { PermissionType } from 'arconnect'
import { useAnalytics } from './analytics'
import { useWalletAnalytics } from './wallet-analytics'

const PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGN_TRANSACTION',
  'ACCESS_PUBLIC_KEY',
  'SIGNATURE'
]

// Module-level refs shared across all useWallet() calls
const address = ref<string>('')
const walletWasCheckedOnLoad = ref(false)
const isConnecting = ref<boolean>(false)
const showWalletNotFoundDialog = ref<boolean>(false)

// Helper function to set address
async function setAddress(newAddress?: string) {
  if (newAddress) {
    address.value = newAddress
    return
  }

  try {
    address.value = await window.arweaveWallet.getActiveAddress()
  } catch (error: any) {
    console.warn('No wallet connected')
  }
}

// Event listener interfaces
interface WalletLoadedEvent extends CustomEvent {
  detail: {
    permissions: PermissionType
  }
}

interface WalletSwitchEvent extends CustomEvent {
  detail: {
    address: string
  }
}

// Set up event listeners once at module level
if (typeof window !== 'undefined') {
  window.addEventListener('arweaveWalletLoaded', ((e: WalletLoadedEvent) => {
    const { permissions } = e.detail

    if (!permissions.length) {
      console.warn('App has no permissions')
    } else {
      setAddress()
    }
  }) as EventListener)

  window.addEventListener('walletSwitch', ((e: WalletSwitchEvent) => {
    const { address: newAddress } = e.detail
    setAddress(newAddress)
    
    // Update analytics session with wallet only if user has consented
    const analytics = useAnalytics()
    const walletAnalytics = useWalletAnalytics()
    if (walletAnalytics.hasWalletConsent(newAddress)) {
      analytics.updateSessionWithWallet(newAddress).catch((analyticsError) => {
        console.error('Failed to update analytics session on wallet switch:', analyticsError)
        // Don't block wallet switch on analytics failure
      })
    }
  }) as EventListener)
}

export function useWallet() {
  const isConnected = computed(() => !!address.value)
  const analytics = useAnalytics()
  const walletAnalytics = useWalletAnalytics()

  async function connect() {
    if (!window.arweaveWallet) {
      console.error('Arweave Wallet not found')
      showWalletNotFoundDialog.value = true
      return
    }

    isConnecting.value = true

    try {
      await window.arweaveWallet.connect(PERMISSIONS)
      address.value = await window.arweaveWallet.getActiveAddress()
      isConnecting.value = false

      // Update analytics session with wallet only if user has consented
      try {
        if (address.value && walletAnalytics.hasWalletConsent(address.value)) {
          await analytics.updateSessionWithWallet(address.value)
        }
      } catch (analyticsError) {
        console.warn('Failed to update analytics session with wallet:', analyticsError)
        // Don't block wallet connection on analytics failure
      }
    } catch (err: any) {
      console.error(`Arweave Wallet Error: ${err.message}`, err)
      isConnecting.value = false
    }
  }

  async function disconnect() {
    await window.arweaveWallet.disconnect()
    address.value = ''
  }

  function getAddress() {
    return address.value
  }

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    walletWasCheckedOnLoad,
    getAddress,
    showWalletNotFoundDialog
  }
}
