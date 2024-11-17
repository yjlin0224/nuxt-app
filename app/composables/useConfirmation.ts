import { useModal } from 'vue-final-modal'

import type {
  ConfirmDialogAction,
  ConfirmDialogProps,
} from '@/components/global/Modal/ConfirmDialog.vue'

import { ModalConfirmDialog } from '#components'

export default function useConfirmation(props: ConfirmDialogProps) {
  const result = ref<ConfirmDialogAction | null>(null)
  return new Promise<ConfirmDialogAction | null>((resolve) => {
    const { open, close } = useModal({
      component: ModalConfirmDialog,
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
