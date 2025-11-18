<template>
  <div class="flex flex-col min-h-screen px-4">
    <header class="flex flex-col">
      <div
        class="flex self-end py-5 gap-3 justify-end relative md:mr-[120px] pr-1"
      >
        <DropdownMenu v-if="isConnected">
          <DropdownMenuTrigger as-child>
            <Button size="sm" class="select-none cursor-pointer">
              {{ address?.slice(0, 4) + '...' + address?.slice(-4) }}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @select="disconnect">
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

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              size="sm"
              variant="ghost"
              class="cursor-pointer md:absolute md:right-[-120px]"
            >
              <span>
                <DesktopIcon v-if="colorMode === 'system'" />
                <MoonIcon v-if="colorMode === 'dark'" />
                <SunIcon v-if="colorMode === 'light'" />
              </span>
              <span class="hidden md:inline-block">
                {{
                  colorMode.charAt(0).toUpperCase() +
                  colorMode.toString().slice(1)
                }}
              </span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="mode = 'light'">
              <SunIcon />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'dark'">
              <MoonIcon />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'auto'">
              <DesktopIcon />

              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div class="flex flex-col items-center gap-3 select-none">
        <a href="/">
          <img
            class="size-32!"
            src="/wuzzy-logo.png"
            alt="Wuzzy Logo"
            v-if="mode === 'light'"
          />
          <img
            class="size-32!"
            src="/wuzzy-logo-dark.png"
            alt="Wuzzy Logo"
            v-else-if="mode === 'dark'"
          />
        </a>
        <h1 class="text-xl! font-normal! mt-0! mb-0!">
          <a href="/"> Wuzzy Permaweb Search </a>
        </h1>
      </div>
    </header>

    <main class="main-router-view-container">
      <RouterView />
    </main>
    
    <!-- Global Audio Player -->
    <GlobalAudioPlayer ref="globalAudioPlayer" />
    
    <!-- Cookie Consent Banner -->
    <CookieConsent />
    
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
</style>

<script setup lang="ts">
import { ChevronDownIcon } from 'lucide-vue-next'
import Button from './components/ui/button/Button.vue'
import DropdownMenu from './components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from './components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import { useWallet } from './composables/wallet'
import DropdownMenuContent from './components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from './components/ui/dropdown-menu/DropdownMenuItem.vue'
import AppConfig from './app-config'
import { useColorMode } from '@vueuse/core'
import { computed, ref, provide, onMounted } from 'vue'
import { SunIcon, MoonIcon, DesktopIcon } from '@radix-icons/vue'
import { headOptions } from './head'
import { useHead } from '@unhead/vue'
import GlobalAudioPlayer from './components/GlobalAudioPlayer.vue'
import CookieConsent from './components/CookieConsent.vue'
import { useAnalytics } from './composables/analytics'

const { address, connect, disconnect, isConnected, isConnecting } = useWallet()
const analytics = useAnalytics()

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
const { store } = useColorMode()

const colorMode = computed(() =>
  store.value === 'auto' ? 'system' : store.value
)

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
</script>
