import { ref } from 'vue'
import type { PermissionType } from 'arconnect'

const PERMISSIONS: PermissionType[] = ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY', 'SIGNATURE']

export function useWallet() {
  const address = ref<string | null>(null)
  const walletWasCheckedOnLoad = ref(false)

  async function connect() {
    if (!window.arweaveWallet) {
      console.error('Arweave Wallet not found')
      return
    }

    try {  
      // const { permissions = [] } = event.detail || {}
      // if (permissions.length === 0) {
      //   // Your app is not connected to the wallet yet, so
      //   // you first need to call `connect()`:
        await window.arweaveWallet.connect(PERMISSIONS)
      // }
      address.value = await window.arweaveWallet.getActiveAddress()
      console.log('address set to', address.value)
    } catch (err: any) {
      console.error(`Arweave Wallet Error: ${ err.message }`, err)
    }
  }

  async function checkWalletOnLoad() {
    if (!walletWasCheckedOnLoad.value) {
      try {
        console.log('checking if already connected', address.value)
        address.value = await window.arweaveWallet.getActiveAddress()
        console.log('already connected with', address.value)
      } catch (error: any) {
        console.log('No wallet connected')
      }
    }
  }

  function getAddress() {
    return address.value
  }

  return { address, connect, checkWalletOnLoad, walletWasCheckedOnLoad, getAddress }
}
