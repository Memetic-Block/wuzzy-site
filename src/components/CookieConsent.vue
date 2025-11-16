<template>
  <div
    v-if="showBanner"
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 py-6 md:py-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold mb-2">
            🍪 We value your privacy
          </h3>
          <p class="text-sm text-muted-foreground max-w-2xl">
            We use analytics to improve your search experience. Your data is anonymized and stored only in your browser. 
            We never use cookies or track you across sites. 
            <router-link to="/privacy" class="underline hover:text-foreground">
              Learn more
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
            Decline
          </Button>
          <Button
            size="sm"
            @click="handleAccept"
            class="cursor-pointer"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAnalytics } from '../composables/analytics'
import { Button } from './ui/button'

const analytics = useAnalytics()
const showBanner = ref(false)

onMounted(async () => {
  // Initialize analytics to load consent status
  await analytics.initialize()
  
  // Show banner if consent is pending
  showBanner.value = analytics.needsConsent()
})

async function handleAccept() {
  await analytics.acceptConsent()
  showBanner.value = false
}

function handleDecline() {
  analytics.declineConsent()
  showBanner.value = false
}
</script>
