import usePocketbaseStores from '~/stores/pocketbase'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const userStore = usePocketbaseStores.user()

  watch(
    () => userStore.isAuthed,
    (newValue) => {
      if (!newValue && route.name !== 'user-auth') {
        navigateTo({ name: 'user-auth', query: { redirect: route.fullPath } })
      }
    },
  )
})
