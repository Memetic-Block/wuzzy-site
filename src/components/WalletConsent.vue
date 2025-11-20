<template>
  <div
    v-if="showBanner"
    class="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 py-6 md:py-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold mb-2">
            Include wallet address in analytics?
          </h3>
          <p class="text-sm text-muted-foreground max-w-2xl">
            Help improve Wuzzy by including your wallet address in anonymous analytics. 
            This helps us understand user behavior patterns while maintaining transparency
            and allows you to be eligible for future rewards. 
            You can update your preferences anytime in settings.
            <router-link to="/privacy" class="underline hover:text-foreground">
              Privacy details
            </router-link>
          </p>
        </div>

        <div class="flex gap-3 items-center">
          <Button
            variant="outline"
            size="sm"
            @click="handleDecline"
            class="cursor-pointer"
          >
            Keep Anonymous
          </Button>
          <Button
            size="sm"
            @click="handleAccept"
            class="cursor-pointer"
          >
            Include Wallet
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWallet } from '../composables/wallet'
import { useWalletAnalytics } from '../composables/wallet-analytics'
import { useAnalytics } from '../composables/analytics'
import { Button } from './ui/button'

const wallet = useWallet()
const walletAnalytics = useWalletAnalytics()
const analytics = useAnalytics()

/**
 * Computed property for banner visibility
 * Automatically updates when any dependency changes
 */
const showBanner = computed(() => {
  // Don't show if general analytics consent is pending or declined
  if (analytics.needsConsent() || !analytics.hasConsent()) {
    return false
  }

  // Don't show on settings page
  if (window.location.pathname === '/settings') {
    return false
  }

  // Show if wallet is connected and needs consent
  return walletAnalytics.needsWalletConsent(wallet.address.value)
})

function handleAccept() {
  if (wallet.address.value) {
    walletAnalytics.acceptWalletConsent(wallet.address.value)
  }
}

function handleDecline() {
  walletAnalytics.declineWalletConsent()
}
</script>
