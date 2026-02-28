import { VueQueryPlugin } from '@tanstack/vue-query'
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
import PrivacyView from './views/privacy.vue'
import TermsView from './views/terms.vue'
import SettingsView from './views/settings.vue'
import AchievementsView from './views/achievements.vue'
import WuzzyConsoleIndexView from './views/console/index.vue'
import WuzzyConsoleHomeView from './views/console/home.vue'
import WuzzyConsoleArnsView from './views/console/arns.vue'
import WuzzyConsoleRegistryView from './views/console/registry.vue'
import WuzzyConsoleNestsView from './views/console/nests/index.vue'
import WuzzyConsoleCrawlersView from './views/console/crawlers.vue'
import WuzzyConsoleNestView from './views/console/nests/nest.vue'
import WuzzyConsoleNewNestView from './views/console/nests/new.vue'

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
  { path: '/privacy', component: PrivacyView },
  { path: '/terms', component: TermsView },
  { path: '/settings', component: SettingsView },
  { path: '/achievements', component: AchievementsView },
  { path: '/console', component: WuzzyConsoleIndexView },
  { path: '/console/home', component: WuzzyConsoleHomeView },
  { path: '/console/arns', component: WuzzyConsoleArnsView },
  { path: '/console/nests', component: WuzzyConsoleNestsView },
  { path: '/console/crawlers', component: WuzzyConsoleCrawlersView },
  { path: '/console/registry', component: WuzzyConsoleRegistryView },
  { path: '/console/nest/:nestId', component: WuzzyConsoleNestView },
  { path: '/console/nests/new', component: WuzzyConsoleNewNestView }
]

export const createApp = ViteSSG(
  App,

  /**
   * vue-router options
   */
  { routes },

  ({ app }) => {
    app.use(VueQueryPlugin)
  }
)
