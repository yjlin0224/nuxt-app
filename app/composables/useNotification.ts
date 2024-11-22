import type { ModalAction } from '~/components/global/Modal/props'

import { useModal } from 'vue-final-modal'

import type { NotifyToastProps } from '~/components/global/Modal/NotifyToast.vue'

import { ModalNotifyToast } from '#components'

export default function useNotification(props: NotifyToastProps) {
  const result = ref<ModalAction | null>(null)
  return new Promise<ModalAction | null>((resolve) => {
    const { open, close } = useModal({
      component: ModalNotifyToast,
      attrs: {
        ...props,
        async onConfirm(action) {
          result.value = action
          await close()
        },
        // @ts-expect-error: `onClosed` is not typed but available
        async onClosed() {
          resolve(result.value)
        },
      },
    })
    open()
  })
}
