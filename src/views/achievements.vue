<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-2!">{{ title }}</h1>
    </header>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-[#667eea] rounded-md animate-spin mb-4"></div>
      <p>Loading achievements...</p>
    </div>

    <div v-else-if="errorMessage" class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <p class="text-red-600 mb-4">{{ errorMessage }}</p>
      <button 
        @click="reloadProcessState" 
        class="px-4 py-2 bg-[#667eea] text-white rounded-md font-medium transition-colors hover:bg-[#5568d3] cursor-pointer"
      >
        Retry
      </button>
    </div>

    <div v-else>
      <!-- User Stats Summary -->
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-12">
        <div class="border border-black dark:border-white rounded-md px-2 py-1 p-8 text-center">
          <div class="text-4xl font-bold leading-none mb-2">{{ userTotalPoints }}</div>
          <div class="text-sm uppercase tracking-wider opacity-90">Total Points</div>
        </div>
        <div class="border border-black dark:border-white rounded-md px-2 py-1 p-8 text-center">
          <div class="text-4xl font-bold leading-none mb-2">{{ userAchievementCount }}</div>
          <div class="text-sm uppercase tracking-wider opacity-90">Achievements Unlocked</div>
        </div>
        <div class="border border-black dark:border-white rounded-md px-2 py-1 p-8 text-center">
          <div class="text-4xl font-bold leading-none mb-2">{{ totalAchievements }}</div>
          <div class="text-sm uppercase tracking-wider opacity-90">Total Available</div>
        </div>
      </div>

      <!-- Achievements Grid -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold mb-6">Wuzzy Achievements</h2>
        <div v-if="achievements.length === 0" class="text-center py-16 px-8">
          <p>No achievements available yet. Check back soon!</p>
        </div>
        <div v-else>
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="border rounded-md p-2 pr-4 my-1 flex gap-4"
            :class="{
              'border-green-500 border-2': achievement.isAwarded,
              'border-gray-300 opacity-80': !achievement.isAwarded
            }"
          >
            <div class="h-20 items-center justify-center rounded-md overflow-hidden">
              <img
                :src="`https://arweave.net/${achievement.icon}`"
                :alt="achievement.name"
                class="w-full h-full object-cover transition-[filter] duration-300"
                :class="{ 'grayscale': !achievement.isAwarded }"
              />
            </div>
            <div class="flex-1 flex flex-col">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <div class="my-1! text-lg font-semibold">{{ achievement.name }}</div>
                  <p class="text-sm mb-3 flex-1">{{ achievement.description }}</p>
                </div>

                <div>
                  <div class="font-semibold text-4xl text-right">{{ achievement.points }}</div>
                  <div 
                    v-if="achievement.isAwarded && achievement.awardedAt" 
                    class="text-xs mt-1 px-3 py-1 rounded-md font-medium border border-green-500 text-green-500 text-center"
                  >
                    Unlocked {{ formatDate(achievement.awardedAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connect Wallet Prompt -->
      <div v-if="!isWalletConnected" class="border-2 border-amber-500 rounded-md p-8 text-center mt-8">
        <p class="text-lg mb-4 text-amber-900">Connect your wallet to view your achievements</p>
        <button 
          @click="connect" 
          class="px-8 py-3 bg-amber-500 text-white rounded-md font-semibold text-base cursor-pointer transition-colors hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isConnecting"
        >
          {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useWallet } from '../composables/wallet'
import { useAchievements } from '../composables/achievements'

const title = 'Permaweb Achievements'
useHead({ title })

const { address, isConnected: isWalletConnected, connect, isConnecting } = useWallet()
const { 
  achievements, 
  totalAchievements, 
  userAchievementCount, 
  userTotalPoints,
  isLoading,
  markAllAsSeen,
  refreshAchievements
} = useAchievements(address)

const errorMessage = ref('')

onMounted(reloadProcessState)

// Watch for wallet address changes and refresh achievements
watch(address, async (newAddress, oldAddress) => {
  // When wallet loads (goes from empty to populated), refresh achievements
  if (newAddress && !oldAddress) {
    await reloadProcessState()
  }
})

// Mark achievements as seen after user has viewed them for 2 seconds
watch([achievements, address], ([newAchievements, newAddress]) => {
  if (newAddress && newAchievements.length > 0 && newAchievements.some(a => a.isAwarded)) {
    setTimeout(() => {
      markAllAsSeen()
    }, 2000)
  }
}, { deep: true })

async function reloadProcessState() {
  try {
    errorMessage.value = ''
    await refreshAchievements()
  } catch (error) {
    errorMessage.value = 'Failed to load achievements. Please try again.'
    console.error('Error reloading achievements:', error)
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>
