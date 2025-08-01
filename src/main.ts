import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import './assets/styles/reset.css'
import './assets/styles/monospace-web.css'
import App from './App.vue'
import IndexView from './views/index.vue'
import SearchView from './views/search.vue'

const routes = [
  { path: '/', component: IndexView },
  { path: '/search', component: SearchView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
