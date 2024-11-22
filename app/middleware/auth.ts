import usePocketbaseStores from '~/stores/pocketbase'

export default defineNuxtRouteMiddleware(async (to) => {
  const userAuthPageName = 'user-auth'
  const userStore = usePocketbaseStores.user()
  if (!userStore.isAuthed && to.name !== userAuthPageName) {
    return navigateTo({ name: userAuthPageName, query: { redirect: to.fullPath } })
  }
})
