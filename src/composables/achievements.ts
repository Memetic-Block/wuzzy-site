import { ref, computed, type Ref } from 'vue'
import { sendAosDryRun } from '../lib/send-aos-message'
import appConfig from '../app-config'

interface CheeseMint {
  points: number
  created_at: number
  id: string
  icon?: string
  updated_at?: number
  description: string
  updated_by?: string
  name: string
  created_by: string
}

interface AwardedMint {
  awarded_by: string
  awarded_at: number
  message_id: string
}

interface CheeseMintsByAddress {
  [mintId: string]: AwardedMint
}

interface ProcessState {
  owner: string
  cheese_mints_by_address: {
    [address: string]: CheeseMintsByAddress
  }
  acl: {
    roles: {
      admin: string[]
    }
  }
  cheese_mints_by_id: {
    [id: string]: CheeseMint
  }
}

export interface Achievement extends CheeseMint {
  isAwarded: boolean
  awardedAt?: number
  awardedBy?: string
  isNew?: boolean
}

const STORAGE_KEY = 'wuzzy_seen_achievements'

// Shared state across all instances
const user_cheese_mints = ref<CheeseMintsByAddress | null>(null)
const cheese_mints_by_id = ref<ProcessState['cheese_mints_by_id'] | null>(null)
const isLoading = ref(false)
const lastFetchTime = ref(0)
const CACHE_DURATION = 60000 // 1 minute cache

function getSeenAchievements(walletAddress: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Set()
    
    const allSeen = JSON.parse(stored) as Record<string, string[]>
    return new Set(allSeen[walletAddress] || [])
  } catch {
    return new Set()
  }
}

function markAchievementsAsSeen(walletAddress: string, achievementIds: string[]) {
  if (typeof window === 'undefined' || !walletAddress) return
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allSeen = stored ? JSON.parse(stored) as Record<string, string[]> : {}
    
    const currentSeen = new Set(allSeen[walletAddress] || [])
    achievementIds.forEach(id => currentSeen.add(id))
    
    allSeen[walletAddress] = Array.from(currentSeen)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSeen))
  } catch (error) {
    console.error('Failed to save seen achievements:', error)
  }
}

async function fetchAchievementsState(address: string, force = false) {
  // Don't fetch if no address provided
  if (!address) { return }

  const now = Date.now()

  // Use cached data if available and recent
  if (!force && user_cheese_mints.value && (now - lastFetchTime.value) < CACHE_DURATION) {
    return
  }
  
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    const { result } = await sendAosDryRun({
      processId: appConfig.achievementsProcessId,
      tags: [
        { name: 'Action', value: 'Get-Cheese-Mints-By-Address' },
        { name: 'Address', value: address }
      ]
    })

    if (result.Messages && result.Messages.length > 0) {
      const state = JSON.parse(result.Messages[0].Data)
      user_cheese_mints.value = state.cheese_mints_by_address
      cheese_mints_by_id.value = state.cheese_mints_by_id
      lastFetchTime.value = now
    }
  } catch (error) {
    console.error('Error fetching achievements state:', error)
  } finally {
    isLoading.value = false
  }
}

export function useAchievements(walletAddress: Ref<string> | string = '') {
  const addressRef = typeof walletAddress === 'string' ? ref(walletAddress) : walletAddress

  // Fetch on first use if needed
  if (!user_cheese_mints.value && !isLoading.value) {
    fetchAchievementsState(addressRef.value)
  }

  const achievements = computed<Achievement[]>(() => {
    if (!user_cheese_mints.value || !cheese_mints_by_id.value) return []

    const userAddress = addressRef.value
    const seenAchievements = userAddress ? getSeenAchievements(userAddress) : new Set()

    return Object.values(cheese_mints_by_id.value).map(mint => {
      const isAwarded = user_cheese_mints.value && userAddress && mint.id in user_cheese_mints.value
      const awardInfo = isAwarded ? user_cheese_mints.value![mint.id] : null
      const isNew = !!(isAwarded && !seenAchievements.has(mint.id))

      return {
        ...mint,
        isAwarded: !!isAwarded,
        awardedAt: awardInfo?.awarded_at,
        awardedBy: awardInfo?.awarded_by,
        isNew
      }
    }).sort((a, b) => {
      // Sort new achievements first, then awarded, then by points
      if (a.isNew && !b.isNew) return -1
      if (!a.isNew && b.isNew) return 1
      if (a.isAwarded && !b.isAwarded) return -1
      if (!a.isAwarded && b.isAwarded) return 1
      return b.points - a.points
    })
  })

  const hasNewAchievements = computed(() => 
    achievements.value.some(a => a.isNew)
  )

  const newAchievementsCount = computed(() => 
    achievements.value.filter(a => a.isNew).length
  )

  const totalAchievements = computed(() => achievements.value.length)

  const userAchievementCount = computed(() => 
    achievements.value.filter(a => a.isAwarded).length
  )

  const userTotalPoints = computed(() => 
    achievements.value
      .filter(a => a.isAwarded)
      .reduce((sum, a) => sum + a.points, 0)
  )

  function markAllAsSeen() {
    if (!addressRef.value) return
    
    const awardedIds = achievements.value
      .filter(a => a.isAwarded)
      .map(a => a.id)
    
    if (awardedIds.length > 0) {
      markAchievementsAsSeen(addressRef.value, awardedIds)
    }
  }

  function refreshAchievements() {
    return fetchAchievementsState(addressRef.value, true)
  }

  return {
    achievements,
    hasNewAchievements,
    newAchievementsCount,
    totalAchievements,
    userAchievementCount,
    userTotalPoints,
    isLoading,
    state: user_cheese_mints,
    markAllAsSeen,
    refreshAchievements
  }
}
