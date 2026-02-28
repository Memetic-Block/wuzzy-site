<template>
  <div class="flex flex-col min-h-screen px-4">
    <header class="items-center py-5 relative">
      <div
        class="flex"
        :class="{
          'flex-col-reverse': route.path === '/',
          'justify-between': route.path !== '/'
        }"
      >
        <!-- Logo -->
        <div
          class="flex text-center items-center select-none"
          :class="{
            'flex-row': route.path !== '/',
            'flex-col': route.path === '/'
          }"
        >
          <router-link to="/" class="inline-block align-middle mr-2">
            <img
              class="select-none transition-scale duration-300 ease-in-out"
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
            </router-link>
          <h1 class="inline-block text-xl! font-normal! mt-0! mb-0! align-middle">
            <a href="/"> Wuzzy Search </a>
          </h1>
        </div>

        <!-- App Menus -->
        <div class="flex flex-row gap-4 ml-auto">
          <div v-if="AppConfig.enableWuzzyConsole" class="self-center">
            <router-link to="/console">Console</router-link>
          </div>

          <!-- Connect Menu -->
          <div>
            <DropdownMenu v-if="isConnected">
              <DropdownMenuTrigger as-child>
                <Button size="sm" class="select-none cursor-pointer relative">
                  {{ address?.slice(0, 4) + '...' + address?.slice(-4) }}
                  <ChevronDownIcon />
                  <span v-if="hasNewAchievements" class="notification-dot"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="router.push('/achievements')" class="cursor-pointer relative">
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
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  size="sm"
                  variant="outline"
                  class="cursor-pointer md:relative md:right-0 select-none"
                >
                  <DesktopIcon v-if="mode === 'auto'" class="size-4 md:size-auto" />
                  <MoonIcon v-else-if="mode === 'dark'" class="size-4 md:size-auto" />
                  <SunIcon v-else class="size-4 md:size-auto" />
                  <span class="hidden md:inline">
                    Settings
                  </span>
                  <ChevronDownIcon class="hidden md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <router-link to="/settings" >
                    <GearIcon class="inline-block" />
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

    <!-- Wallet Not Found Dialog -->
    <WalletNotFoundDialog />
    
    <footer class="mt-auto pb-2 pt-12">
      <img
        v-if="mode === 'dark'"
        class="footer-wuzzy-logo"
        src="/wuzzy-inverted.png"
        alt="Wuzzy"
      />
      <img v-else class="footer-wuzzy-logo" src="/wuzzy.png" alt="Wuzzy" />
      <p class="footer-credits">
        <router-link class="underline" to="/about">About</router-link>
        &nbsp;
        <a
          class="underline"
          to="https://docs_wuzzy.arweave.net"
          target="_blank"
          rel="noopener"
        >Docs</a>
        &nbsp;
        <a
          class="underline"
          href="https://github.com/memetic-block/wuzzy"
          target="_blank"
          rel="noopener"
        >GitHub</a>
        &nbsp;
        <a
          class="underline"
          href="https://x.com/wuzzysearch"
          target="_blank"
          rel="noopener"
        >x.com/wuzzysearch</a>
        &nbsp;
        <router-link class="underline" to="/privacy">Privacy</router-link>
        &nbsp;
        <router-link class="underline" to="/terms">Terms</router-link>
      </p>
      <p class="footer-credits">
        Built &amp; Operated by
        <a
          class="underline"
          href="https://memeticblock.com"
          target="_blank"
          rel="noopener"
        >Memetic Block</a>
      </p>
      <p class="footer-credits">
        <a class="underline" target="_blank" rel="noopener noreferrer" :href="versionUrl">{{
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
import { ref, provide, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SunIcon, MoonIcon, DesktopIcon, GearIcon } from '@radix-icons/vue'
import { headOptions } from './head'
import { useHead } from '@unhead/vue'
import GlobalAudioPlayer from './components/GlobalAudioPlayer.vue'
import CookieConsent from './components/CookieConsent.vue'
import WalletConsent from './components/WalletConsent.vue'
import WalletNotFoundDialog from './components/WalletNotFoundDialog.vue'
import { useAnalytics } from './composables/analytics'
import { useAchievements } from './composables/achievements'
import { useQueryClient } from '@tanstack/vue-query'

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

const queryClient = useQueryClient()
watch(address, () => queryClient.invalidateQueries({ queryKey: ['my-arns'] }))
</script>
