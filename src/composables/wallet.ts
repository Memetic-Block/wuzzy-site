import { computed, ref, watch } from 'vue'

declare global {
  interface Window {
    arweaveWallet: any
    process: any
  }
}

const PERMISSIONS = [
  'ACCESS_ADDRESS',
  'SIGN_TRANSACTION',
  'ACCESS_PUBLIC_KEY',
  'SIGNATURE'
]

export function useWallet() {
  const address = ref<string | null>(null)
  const walletWasCheckedOnLoad = ref(false)
  const isConnected = computed(() => !!address.value)
  const isConnecting = ref<boolean>(false)

  async function connect() {
    if (!window.arweaveWallet) {
      console.error('Arweave Wallet not found')
      return
    }

    isConnecting.value = true

    try {
      await window.arweaveWallet.connect(PERMISSIONS)
      address.value = await window.arweaveWallet.getActiveAddress()
      isConnecting.value = false
      // console.log('address set to', address.value)
    } catch (err: any) {
      console.error(`Arweave Wallet Error: ${err.message}`, err)
      isConnecting.value = true
    }
  }

  async function disconnect() {
    await window.arweaveWallet.disconnect()
    address.value = ''
  }

  function getAddress() {
    return address.value
  }

  async function setAddress() {
    try {
      address.value = await window.arweaveWallet.getActiveAddress()
    } catch (error: any) {
      console.error('No wallet connected')
    }
  }

  interface WalletLoadedEvent extends CustomEvent {
    detail: {
      permissions: typeof PERMISSIONS
    }
  }

  window.addEventListener('arweaveWalletLoaded', ((e: WalletLoadedEvent) => {
    const { permissions } = e.detail

    if (!permissions.length) {
      console.warn('App has no permissions')
    } else {
      setAddress()
    }
  }) as EventListener)

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    walletWasCheckedOnLoad,
    getAddress
  }
}
