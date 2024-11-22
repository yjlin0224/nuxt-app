export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    const themeStore = useThemeStore()
    themeStore.initialize()
  })
})
