import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Mango 🥭',
  description: 'Mangobase: Low-code Javscript backend framework',
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
            { text: 'Recap on REST', link: '/guide/recap-rest'},
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Dashboard', link: '/guide/dashboard' },
            { text: 'Development and Production', link: '/guide/dev-prod'}
          ],
        },
        {
          text: 'Concepts',
          items: [
            { text: 'Context', link: '/guide/context'},
            { text: 'Hooks', link: '/guide/hooks'},
            { text: 'Query', link: '/guide/query'},
            { text: 'Migrations', link: '/guide/migrations'},
          ]
        },
        {
          text: 'Extras',
          items: [
            { text: 'Server adapters', link: '/guide/server-adapters'},
            { text: 'Database adapters', link: '/guide/server-adapters'},
            { text: 'Plugins', link: '/guide/plugins'},
            { text: 'FAQs', link: '/guide/faqs'},
          ]
        }
      ],
      '/api/': [
        {
          text: 'Modules',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Dashboard', link: '/guide/dashboard' },
            { text: 'Development and Production', link: '/guide/dev-prod'}
          ],
        },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/blackmann/mangobase' },
    ],

    search: {
      provider: 'local',
    },
  },
})
