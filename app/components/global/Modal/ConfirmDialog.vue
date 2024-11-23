<script lang="ts">
import type { VBtn, VIcon } from 'vuetify/components'
import type { ModalAction } from '~/components/global/Modal/props'

import { VueFinalModal } from 'vue-final-modal'

import {
  ModalActions,
  ModalType,
  modalActionButtonProps,
  modalIconProps,
} from '~/components/global/Modal/props'

export type ConfirmDialogProps = {
  type?: ModalType
  title?: string
  message?: string
  code?: string
  actions?: ModalAction[]
  persistent?: boolean
  showCloseButton?: boolean
  maxWidth?: number
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  type: ModalType.None,
  title: '',
  message: '',
  code: '',
  actions: () => ModalActions.Ok,
  persistent: false,
  showCloseButton: true,
  maxWidth: 400,
})

const emits = defineEmits<{
  confirm: [action: ModalAction]
}>()

const iconProps = computed(() => modalIconProps[props.type])
</script>

<template>
  <VueFinalModal
    class="v-overlay v-overlay--active v-dialog"
    style="pointer-events: auto"
    overlay-class="v-overlay__scrim"
    overlay-style="pointer-events: none"
    content-class="v-overlay__content"
    content-transition="vfm-fade"
    :content-style="`max-width: ${props.maxWidth}px`"
    :z-index-fn="({ index }) => 3000 + index"
    :click-to-close="!props.persistent"
    :esc-to-close="!props.persistent"
    :prevent-navigation-gestures="props.persistent"
  >
    <!-- @vue-expect-error: `close` is not typed but available -->
    <template #default="{ close }">
      <VCard>
        <VToolbar>
          <template v-if="is.plainObject(iconProps)" #prepend>
            <VIcon v-bind="iconProps" />
          </template>
          <template #append>
            <VBtn v-if="showCloseButton" icon="mdi-close" @click="close()" />
          </template>
          <VToolbarTitle>
            <template v-if="is.nonEmptyStringAndNotWhitespace(props.title)">
              {{ props.title }}
            </template>
            <slot v-else name="title" />
          </VToolbarTitle>
        </VToolbar>
        <VCardText style="white-space: pre-line">
          <template v-if="is.nonEmptyStringAndNotWhitespace(props.message)">
            {{ props.message }}
          </template>
          <slot v-else />
          <code>
            <template v-if="is.nonEmptyStringAndNotWhitespace(props.code)">
              {{ props.code }}
            </template>
            <slot name="code" />
          </code>
        </VCardText>
        <template v-if="props.actions.length > 0">
          <VDivider />
          <VCardActions>
            <VBtn
              v-for="action in props.actions"
              :key="action"
              class="flex-1-0"
              v-bind="modalActionButtonProps[action]"
              variant="tonal"
              @click="emits('confirm', action)"
            />
          </VCardActions>
        </template>
      </VCard>
      <!-- v-dialog css loading hack -->
      <VDialog v-if="false" />
    </template>
  </VueFinalModal>
</template>
