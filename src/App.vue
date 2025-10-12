<template>
  <div class="flex flex-col min-h-screen px-4">
    <div class="flex flex-col items-center gap-3 pt-10">
      <img class="size-32" src="/wuzzy-logo.png" alt="Wuzzy Logo" />
      <h1 class="text-xl! font-normal! mt-0! mb-5!">
        <a href="/"> Wuzzy Permaweb Search </a>
      </h1>
    </div>

    <!-- <template v-if="address">
    Connected as {{ address }}
  </template>
  
  <template v-else>
    <button @click="onConnectClicked">Connect Wallet</button>
  </template> -->

    <main class="main-router-view-container">
      <RouterView />
    </main>
    <footer class="mt-auto pb-2">
      <img class="footer-wuzzy-logo" src="/wuzzy.png" alt="Wuzzy Logo" />
      <p class="footer-credits">
        <a href="https://docs_wuzzy.arweave.net" target="_blank">Docs</a>
        &nbsp;
        <a href="https://github.com/memetic-block/wuzzy" target="_blank"
          >GitHub</a
        >
      </p>
      <p class="footer-credits">
        Built &amp; Operated by
        <a href="https://memeticblock.com" target="_blank">Memetic Block</a>
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
  padding-bottom: 2rem;
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
// import { onMounted } from 'vue'
// import { useWallet } from './composables/wallet'

// const {
//   address,
//   connect,
//   checkWalletOnLoad
// } = useWallet()

// const onConnectClicked = async () => {
//   await connect()
//   console.log('got address', address.value)
// }

// onMounted(checkWalletOnLoad)
</script>
