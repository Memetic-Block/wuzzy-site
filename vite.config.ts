import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import generateSitemap from 'vite-ssg-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  ssgOptions: {
    onFinished() {
      const hostname = process.env.VITE_SITE_HOSTNAME
      if (!hostname) {
        throw new Error('VITE_SITE_HOSTNAME is required for sitemap generation')
      }

      const allowIndexing = process.env.VITE_ALLOW_INDEXING === 'true'
      const timestamp = process.env.VITE_VERSION_TIMESTAMP
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
} as any)
