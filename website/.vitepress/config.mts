import { defineConfig } from 'vitepress'
import apiPaths from './api-paths.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Mango 🥭',
  description: 'Mangobase: Low-code Javscript backend framework',
  base: '/mangobase/',
  sitemap: {
    hostname: 'https://degreat.co.uk/mangobase/',
    lastmodDateOnly: true,
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Start here',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Recap on REST', link: '/guide/rest' },
            { text: 'Dashboard', link: '/guide/dashboard' },
            { text: 'Deployment', link: '/guide/deployment' },
          ],
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Context', link: '/guide/context' },
            { text: 'Hooks', link: '/guide/hooks' },
            { text: 'Paths & Queries', link: '/guide/query' },
            { text: 'Migrations', link: '/guide/migrations' },
          ],
        },
        {
          text: 'Extras',
          items: [
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'Server adapters', link: '/guide/server-adapters' },
            { text: 'Database adapters', link: '/guide/database-adapters' },
            { text: 'Version control', link: '/guide/version-control' },
            { text: 'Plugins', link: '/guide/plugins' },
            { text: 'FAQs', link: '/guide/faqs' },
          ],
        },
      ],
      '/api/': apiPaths,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/blackmann/mangobase' },
    ],

    search: {
      provider: 'local',
    },
    outline: [2, 4],
  },
  head: [
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://github.com/blackmann/mangobase/raw/master/assets/ss-dark.png'
      }
    ],
    [
      'script',
      {
        async: '',
        src: 'https://analytics.umami.is/script.js',
        'data-website-id': '6cc8bf19-147d-45a2-b7c9-75b7c1b607bf',
      },
    ],
    [
      'script',
      {
        async: '',
        src: 'https://0.observe.so/script.js',
        'data-app': 'clws46cwl00go8k13jz4apght',
      },
    ],
  ],
})
