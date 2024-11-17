export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxtjs/google-fonts',
    '@nuxtjs/stylelint-module',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@vueuse/nuxt',
    'vuetify-nuxt-module',
  ],
  googleFonts: {
    families: {
      'Roboto': {
        wght: [100, 300, 400, 500, 700, 900],
        ital: [100, 300, 400, 500, 700, 900],
      },
      'Roboto Serif': {
        wght: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        ital: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
      'Roboto Mono': {
        wght: [100, 200, 300, 400, 500, 600, 700],
        ital: [100, 200, 300, 400, 500, 600, 700],
      },
      'Noto Sans': {
        wght: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        ital: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
      'Noto Sans Mono': {
        wght: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
      'Noto Sans TC': {
        wght: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
      'Noto Serif': {
        wght: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        ital: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
      'Noto Serif TC': {
        wght: [200, 300, 400, 500, 600, 700, 800, 900],
      },
    },
    preload: true,
    useStylesheet: true,
    download: false,
  },
  pinia: {
    storesDirs: ['stores/**'],
  },
  vuetify: {
    moduleOptions: {
      prefixComposables: true,
      styles: {
        configFile: 'assets/styles/vuetify.scss',
      },
    },
    vuetifyOptions: 'vuetify.config.ts',
  },
  css: ['vue-final-modal/style.css'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-Hant-TW', // remove when `i18n` module is used
      },
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  features: {
    inlineStyles: false, // disable when `vuetify.styles.configFile` is defined
  },
  imports: {
    presets: [
      // FIXME: Unable to resolve types, likely due to a bug of nuxt or unimport.
      //   Temporarily resolved by manually creating an `import.d.ts` file,
      //   so `dtsDisabled` needs to be set to `true`.
      {
        from: '@sindresorhus/is',
        dtsDisabled: true,
        imports: [{ name: 'default', as: 'is' }],
      },
      {
        from: '@sindresorhus/is',
        dtsDisabled: true,
        imports: [{ name: 'assert', as: 'assert' }],
      },
      {
        from: 'yup',
        dtsDisabled: true,
        imports: [{ name: '*', as: 'yup' }],
      },
      {
        from: 'remeda',
        dtsDisabled: true,
        imports: [{ name: '*', as: 'R' }],
      },
      {
        from: 'luxon',
        dtsDisabled: true,
        imports: [
          { name: 'DateTime' },
          { name: 'Zone' },
          { name: 'Duration' },
          { name: 'Interval' },
        ],
      },
    ],
  },
  runtimeConfig: {
    public: {
      pocketbaseUrl: 'http://127.0.0.1:8090',
    },
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
})

/*
TODO: Try these modules
https://hub.nuxt.com/docs/recipes/drizzle // lightweight ORM
https://nuxt.com/modules/apollo // GraphQL, use with prisma
https://nuxt.com/modules/auto-animate
https://nuxt.com/modules/color-mode
https://nuxt.com/modules/date-fns // v3
https://nuxt.com/modules/fonts // when fonts can loaded without exposed (`assets.strategy`)
https://nuxt.com/modules/i18n
https://nuxt.com/modules/image
https://nuxt.com/modules/magic-regexp
https://nuxt.com/modules/prisma // or drizzle, work with https://sqlc.dev/ if Go server
https://nuxt.com/modules/scalar // probably included in nitro
https://nuxt.com/modules/security
https://nuxt.com/modules/sentry // error tracking platform
https://nuxt.com/modules/seo
https://nuxt.com/modules/unocss
https://nuxt.com/modules/vite-pwa-nuxt
*/
