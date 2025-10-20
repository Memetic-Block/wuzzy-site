import { computed, ref } from 'vue'
import type { PermissionType } from 'arconnect'

const PERMISSIONS: PermissionType[] = [
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

  interface WalletLoadedEvent extends CustomEvent {
    detail: {
      permissions: PermissionType
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

  interface WalletSwitchEvent extends CustomEvent {
    detail: {
      address: string
    }
  }

  window.addEventListener('walletSwitch', ((e: WalletSwitchEvent) => {
    const { address } = e.detail
    setAddress(address)
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
