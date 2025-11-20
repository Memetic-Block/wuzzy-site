<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-2">Settings</h1>
    <p class="text-muted-foreground mb-8">
      Manage your privacy preferences and data settings
    </p>

    <!-- Analytics Settings Section -->
    <div class="space-y-6">
      <div class="border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Privacy &amp; Analytics</h2>
        
        <!-- Anonymous Analytics Toggle -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1 mr-4">
            <h3 class="font-medium mb-1">Anonymous Analytics</h3>
            <p class="text-sm text-muted-foreground">
              Help improve Wuzzy by sharing anonymized usage data. No personal information is collected.
            </p>
          </div>
          <Switch
            :checked="analyticsEnabled"
            @update:modelValue="handleAnalyticsToggle"
          />
        </div>

        <!-- Wallet Analytics Toggle -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1 mr-4">
            <h3 class="font-medium mb-1">Include Wallet Address</h3>
            <p class="text-sm text-muted-foreground">
              Include your wallet address in analytics to help us understand user patterns.
              <span v-if="!analyticsEnabled" class="block text-xs mt-1 text-amber-600 dark:text-amber-400">
                (Requires Anonymous Analytics to be enabled)
              </span>
              <span v-else-if="!isWalletConnected" class="block text-xs mt-1 text-amber-600 dark:text-amber-400">
                (Requires wallet to be connected)
              </span>
            </p>
          </div>
          <Switch
            :checked="walletAnalyticsEnabled"
            @update:modelValue="handleWalletAnalyticsToggle"
            :disabled="!analyticsEnabled || !isWalletConnected"
          />
        </div>

        <!-- Info box when wallet not connected -->
        <div
          v-if="analyticsEnabled && !isWalletConnected"
          class="bg-muted p-4 rounded-md text-sm text-muted-foreground"
        >
          <p>
            Connect your wallet to enable wallet address tracking in analytics.
          </p>
        </div>
      </div>

      <!-- Data Management Section -->
      <div class="border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Data Management</h2>
        
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">
            All data is stored locally in your browser. Clearing your data will remove all analytics preferences and session information.
          </p>
          
          <Button
            variant="destructive"
            @click="handleClearData"
            :disabled="isClearing"
            class="cursor-pointer"
          >
            {{ isClearing ? 'Clearing Data...' : 'Clear All Data' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Back to home link -->
    <div class="mt-8 text-center">
      <router-link to="/" class="text-sm text-muted-foreground underline hover:text-foreground">
        ← Back to Search
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalytics } from '../composables/analytics'
import { useWalletAnalytics } from '../composables/wallet-analytics'
import { useWallet } from '../composables/wallet'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { analyticsQueue } from '../composables/analytics-queue'

const analytics = useAnalytics()
const walletAnalytics = useWalletAnalytics()
const wallet = useWallet()

const isClearing = ref(false)

const analyticsEnabled = computed(() => analytics.consentStatus.value === 'accepted')
const isWalletConnected = computed(() => !!wallet.address.value)
const walletAnalyticsEnabled = computed(() => walletAnalytics.consentStatus.value === 'accepted' && !!wallet.address.value)

onMounted(() => {
  // Ensure analytics is initialized
  if (!analytics.isInitialized.value) {
    analytics.initialize()
  }
})

async function handleAnalyticsToggle(enabled: boolean) {
  console.log('Analytics toggle clicked:', enabled)
  console.log('Current consent status:', analytics.consentStatus.value)
  
  if (enabled) {
    await analytics.acceptConsent()
    console.log('After accept, consent status:', analytics.consentStatus.value)
    console.log('LocalStorage value:', localStorage.getItem('wuzzy_analytics_consent'))
  } else {
    // Declining analytics will cascade to wallet analytics
    analytics.declineConsent()
    console.log('After decline, consent status:', analytics.consentStatus.value)
    console.log('LocalStorage value:', localStorage.getItem('wuzzy_analytics_consent'))
  }
}

async function handleWalletAnalyticsToggle(enabled: boolean) {
  console.log('Wallet analytics toggle clicked:', enabled)
  
  if (!wallet.address.value) {
    console.warn('No wallet connected')
    return
  }

  if (enabled) {
    walletAnalytics.acceptWalletConsent(wallet.address.value)
    console.log('After wallet accept, consent status:', walletAnalytics.consentStatus.value)
    console.log('LocalStorage value:', localStorage.getItem('wuzzy_wallet_consent'))
  } else {
    walletAnalytics.declineWalletConsent()
    console.log('After wallet decline, consent status:', walletAnalytics.consentStatus.value)
    console.log('LocalStorage value:', localStorage.getItem('wuzzy_wallet_consent'))
  }
}

async function handleClearData() {
  const confirmed = window.confirm(
    'Are you sure you want to clear all data? This will remove all analytics preferences and session information. This action cannot be undone.'
  )

  if (!confirmed) return

  isClearing.value = true

  try {
    // Clear analytics session and consent
    analytics.clearSession()
    
    // Clear analytics queue
    analyticsQueue.clear()
    
    // Reload page to reset state
    setTimeout(() => {
      window.location.reload()
    }, 500)
  } catch (error) {
    console.error('Failed to clear data:', error)
    isClearing.value = false
  }
}
</script>
