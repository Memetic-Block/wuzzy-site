import { defineConfig, loadEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { type ViteSSGOptions } from 'vite-ssg'
import generateSitemap from 'vite-ssg-sitemap'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'process.env': {},
      'process.browser': true
    },
    plugins: [
      vue(),
      tailwindcss(),
      nodePolyfills({
        include: ['crypto', 'process', 'stream', 'buffer']
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    ssgOptions: {
      onFinished() {
        const hostname = env.VITE_SITE_HOSTNAME
        if (!hostname) {
          throw new Error('VITE_SITE_HOSTNAME is required for sitemap generation')
        }

        const allowIndexing = env.VITE_ALLOW_INDEXING === 'true'
        const timestamp = env.VITE_VERSION_TIMESTAMP
        const lastmod = timestamp ? new Date(timestamp) : new Date()

        generateSitemap({
          hostname,
          exclude: [
            '/nest/:nestId',
            '/nest/:nestId/search',
            '/crawler/:crawlerId'
          ],
          priority: {
            '/': 1.0,
            '*': 0.8
          },
          changefreq: {
            '*': 'weekly'
          },
          lastmod,
          readable: true,
          robots: allowIndexing
            ? [{ userAgent: '*', allow: '/' }]
            : [{ userAgent: '*', disallow: '/' }]
        })
      }
    }
  } satisfies ViteSSGOptions & UserConfig
})
