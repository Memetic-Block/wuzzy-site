<template>
  <h1><a class="wuzzy-search-logo" href="/">Wuzzy Permaweb Search</a></h1>

  <!-- <template v-if="address">
    Connected as {{ address }}
  </template>
  
  <template v-else>
    <button @click="onConnectClicked">Connect Wallet</button>
  </template> -->

  <main class="main-router-view-container">
    <RouterView />
  </main>
  <footer>
    <img class="footer-wuzzy-logo" src="/wuzzy.png" alt="Wuzzy Logo" />
    <p class="footer-credits">
      Built &amp; Operated by
      <a href="https://memeticblock.com" target="_blank">Memetic Block</a>
    </p>
  </footer>
</template>

<style scoped>
.wuzzy-search-logo {
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
