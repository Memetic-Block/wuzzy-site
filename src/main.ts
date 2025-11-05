import { ViteSSG } from 'vite-ssg'

// import "./assets/styles/reset.css";
import './assets/styles/fonts.css'
import './assets/styles/monospace-web.css'
import './assets/styles/global.css'
import App from './App.vue'
import IndexView from './views/index.vue'
import SearchView from './views/search.vue'
import NestView from './views/nest.vue'
import NestSearchView from './views/nest/search.vue'
import CrawlerView from './views/crawler.vue'
import RegistryView from './views/registry.vue'
import AboutView from './views/about.vue'
import ImageSearchView from './views/image-search.vue'
import VideoSearchView from './views/video-search.vue'
import AudioSearchView from './views/audio-search.vue'

const routes = [
  { path: '/', component: IndexView },
  { path: '/search', component: SearchView },
  { path: '/nest/:nestId', component: NestView },
  { path: '/nest/:nestId/search', component: NestSearchView },
  { path: '/crawler/:crawlerId', component: CrawlerView },
  { path: '/registry', component: RegistryView },
  { path: '/about', component: AboutView },
  { path: '/images', component: ImageSearchView },
  { path: '/videos', component: VideoSearchView },
  { path: '/audio', component: AudioSearchView },
]

export const createApp = ViteSSG(
  App,

  // vue-router options
  { routes }
)
