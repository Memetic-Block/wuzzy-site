<template>
  <div class="flex flex-col min-h-screen px-4">
    <header class="flex flex-col">
      <div class="self-end py-5">
        <DropdownMenu v-if="isConnected">
          <DropdownMenuTrigger as-child>
            <Button size="sm">
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
        <Button variant="outline" size="sm" v-else-if="isConnecting" disabled>
          Connecting...
        </Button>
        <Button variant="outline" size="sm" v-else @click="connect">
          Connect Wallet
        </Button>
      </div>
      <div class="flex flex-col items-center gap-3 pt-5">
        <a href="/">
          <img class="size-32!" src="/wuzzy-logo.png" alt="Wuzzy Logo" />
        </a>
        <h1 class="text-xl! font-normal! mt-0! mb-0!">
          <a href="/"> Wuzzy Permaweb Search </a>
        </h1>
      </div>
    </header>

    <main class="main-router-view-container">
      <RouterView />
    </main>
    <footer class="mt-auto pb-2">
      <img class="footer-wuzzy-logo" src="/wuzzy.png" alt="Wuzzy Logo" />
      <p class="footer-credits">
        <a
          class="underline"
          href="/about"
          >About</a
        >
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
        <a
          class="underline"
          href="https://x.com/wuzzysearch"
          target="_blank"
          >x.com/wuzzysearch</a
        >
      </p>
      <p class="footer-credits">
        Built &amp; Operated by
        <a class="underline" href="https://memeticblock.com" target="_blank"
          >Memetic Block</a
        >
      </p>
      <p class="footer-credits">
        <a
          class="underline"
          target="_blank"
          :href="versionUrl"
          >{{ versionLabel }}</a
        >
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

const { address, connect, disconnect, isConnected, isConnecting } = useWallet()
const versionUrl = ['stage', 'development'].includes(AppConfig.releaseTag) || !AppConfig.releaseTag
  ? `https://github.com/Memetic-Block/wuzzy-site/commit/${AppConfig.versionSha}`
  : `https://github.com/Memetic-Block/wuzzy-site/releases/tag/v${AppConfig.releaseTag}`
const versionLabel = ['stage', 'development'].includes(AppConfig.releaseTag) || !AppConfig.releaseTag
  ? AppConfig.versionSha.slice(0, 7)
  : `v${AppConfig.releaseTag}`
</script>
