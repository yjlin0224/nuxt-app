// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxtjs/stylelint-module',
    'vuetify-nuxt-module',
    '@nuxt/fonts'
  ],
  eslint: {
    config: {
      stylistic: {
        semi: true,
      }
    }
  },
  devtools: { enabled: true }
})
