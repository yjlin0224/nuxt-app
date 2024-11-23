import { ModalActions, ModalType } from '~/components/global/Modal/props'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error, instance, info) => {
    const instanceString = JSON.stringify(instance?.$?.type ?? {})
    useNotification({
      type: ModalType.Error,
      message: `發生未處理的錯誤\n描述：${error}\n實例：${instanceString}\n資訊：${info}`,
      location: 'top center',
      timeout: -1,
      actions: ModalActions.Ok,
    })
  })
})
