<template>
  <div class="flex flex-col min-h-screen px-4">
    <header class="items-center py-5 relative">
      <div class="grid grid-cols-6 gap-4">
        <!-- TODO: fix mobile layout of header -->

        <!-- Logo -->
        <div class="text-center col-span-2 col-start-3 items-center select-none">
          <a href="/" class="inline-block align-middle mr-2">
            <img
              class="transition-scale duration-300 ease-in-out"
              :class="{
                'size-32!': route.path === '/',
                'size-8!': route.path !== '/'
              }"
              src="/wuzzy-logo.png"
              alt="Wuzzy Logo"
              v-if="mode === 'light'"
            />
            <img
              :class="{
                'size-32!': route.path === '/',
                'size-8!': route.path !== '/'
              }"
              src="/wuzzy-logo-dark.png"
              alt="Wuzzy Logo"
              v-else-if="mode === 'dark'"
            />
          </a>
          <h1 class="inline-block text-xl! font-normal! mt-0! mb-0! align-middle">
            <a href="/"> Wuzzy Permaweb Search </a>
          </h1>
        </div>

        <div class="col-span-2 text-right">
          <!-- Connect Menu -->
          <div class="inline-block align-top mr-2">
            <DropdownMenu v-if="isConnected">
              <DropdownMenuTrigger as-child>
                <Button size="sm" class="select-none cursor-pointer relative">
                  {{ address?.slice(0, 4) + '...' + address?.slice(-4) }}
                  <ChevronDownIcon />
                  <span v-if="hasNewAchievements" class="notification-dot"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="goToAchievements" class="cursor-pointer relative">
                  Achievements
                  <span v-if="hasNewAchievements" class="menu-notification-dot"></span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @select="disconnect" class="cursor-pointer">
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              class="cursor-pointer"
              v-else-if="isConnecting"
              disabled
            >
              Connecting...
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="cursor-pointer"
              v-else
              @click="connect"
            >
              Connect Wallet
            </Button>
          </div>

          <!-- Settings Menu -->
          <div class="inline-block align-top">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  size="sm"
                  variant="ghost"
                  class="cursor-pointer md:relative md:right-0 select-none"
                >
                  <DesktopIcon v-if="mode === 'auto'" class="size-4 md:size-auto" />
                  <MoonIcon v-else-if="mode === 'dark'" class="size-4 md:size-auto" />
                  <SunIcon v-else class="size-4 md:size-auto" />
                  <!-- <span class="hidden md:inline"> -->
                    Settings
                  <!-- </span> -->
                  <ChevronDownIcon class="hidden md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <router-link to="/settings" >
                    Settings
                  </router-link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="mode = 'light'" class="cursor-pointer">
                  <SunIcon />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem @click="mode = 'dark'" class="cursor-pointer">
                  <MoonIcon />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem @click="mode = 'auto'" class="cursor-pointer">
                  <DesktopIcon />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <main class="main-router-view-container">
      <RouterView />
    </main>
    
    <!-- Global Audio Player -->
    <GlobalAudioPlayer ref="globalAudioPlayer" />
    
    <!-- Cookie Consent Banner -->
    <CookieConsent />
    
    <!-- Wallet Consent Banner -->
    <WalletConsent />
    
    <footer class="mt-auto pb-2 pt-12">
      <img
        v-if="mode === 'dark'"
        class="footer-wuzzy-logo"
        src="/wuzzy-inverted.png"
        alt="Wuzzy"
      />
      <img v-else class="footer-wuzzy-logo" src="/wuzzy.png" alt="Wuzzy" />
      <p class="footer-credits">
        <a class="underline" href="/about">About</a>
        &nbsp;
        <a
          class="underline"
          href="https://docs_wuzzy.arweave.net"
          target="_blank"
          >Docs</a
        >
        &nbsp;
        <a
          class="underline"
          href="https://github.com/memetic-block/wuzzy"
          target="_blank"
          >GitHub</a
        >
        &nbsp;
        <a class="underline" href="https://x.com/wuzzysearch" target="_blank"
          >x.com/wuzzysearch</a
        >
        &nbsp;
        <a class="underline" href="/privacy">Privacy</a>
        &nbsp;
        <a class="underline" href="/terms">Terms</a>
      </p>
      <p class="footer-credits">
        Built &amp; Operated by
        <a class="underline" href="https://memeticblock.com" target="_blank"
          >Memetic Block</a
        >
      </p>
      <p class="footer-credits">
        <a class="underline" target="_blank" :href="versionUrl">{{
          versionLabel
        }}</a>
        @ {{ AppConfig.versionTimestamp }}
      </p>
    </footer>
  </div>
</template>

<style scoped>
.wuzzy-search-logo {
  display: inline-block;
  margin-bottom: -6px;
  width: 32px;
  height: 32px;
}
.wuzzy-search-logo-text {
  text-decoration: none;
  color: var(--text-color);
  font-weight: var(--font-weight-bold);
}
.main-router-view-container {
  flex: 1;
}
.footer-wuzzy-logo {
  width: 32px;
  height: 32px;
  margin: 0 auto;
}
.footer-credits {
  font-size: smaller;
  margin: 0 auto;
  text-align: center;
}

.notification-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 2px solid white;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.menu-notification-dot {
  position: absolute;
  top: 40%;
  right: -1px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
</style>

<script setup lang="ts">
import { ChevronDownIcon } from 'lucide-vue-next'
import Button from './components/ui/button/Button.vue'
import DropdownMenu from './components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from './components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useWallet } from './composables/wallet'
import DropdownMenuContent from './components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from './components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuSeparator from './components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import AppConfig from './app-config'
import { useColorMode } from '@vueuse/core'
import { ref, provide, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SunIcon, MoonIcon, DesktopIcon } from '@radix-icons/vue'
import { headOptions } from './head'
import { useHead } from '@unhead/vue'
import GlobalAudioPlayer from './components/GlobalAudioPlayer.vue'
import CookieConsent from './components/CookieConsent.vue'
import WalletConsent from './components/WalletConsent.vue'
import { useAnalytics } from './composables/analytics'
import { useAchievements } from './composables/achievements'

const { address, connect, disconnect, isConnected, isConnecting } = useWallet()
const { hasNewAchievements } = useAchievements(address)
const analytics = useAnalytics()
const router = useRouter()
const route = useRoute()

// Initialize analytics on app mount
onMounted(() => {
  try {
    analytics.initialize()
  } catch (error) {
    console.error('Failed to initialize analytics:', error)
    // Don't block app on analytics failure
  }
})

// Global audio player reference
const globalAudioPlayer = ref<InstanceType<typeof GlobalAudioPlayer>>()

// Provide the audio player to all child components
provide('audioPlayer', globalAudioPlayer)

const mode = useColorMode()

const versionUrl =
  ['stage', 'development'].includes(AppConfig.releaseTag) ||
  !AppConfig.releaseTag
    ? `https://github.com/Memetic-Block/wuzzy-site/commit/${AppConfig.versionSha}`
    : `https://github.com/Memetic-Block/wuzzy-site/releases/tag/v${AppConfig.releaseTag}`
const versionLabel =
  ['stage', 'development'].includes(AppConfig.releaseTag) ||
  !AppConfig.releaseTag
    ? AppConfig.versionSha.slice(0, 7)
    : `v${AppConfig.releaseTag}`

useHead(headOptions)

function goToAchievements() {
  router.push('/achievements')
}
</script>
