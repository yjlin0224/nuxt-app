<script lang="ts">
import type { VSnackbar } from 'vuetify/components'

import { VueFinalModal } from 'vue-final-modal'

import {
  type ModalAction,
  ModalActions,
  ModalType,
  modalActionButtonProps,
  modalIconProps,
} from '~/components/global/Modal/props'

export type NotifyToastProps = {
  type?: ModalType
  message?: string
  actions?: ModalAction[]
  location?: VSnackbar['$props']['location']
  timeout?: number
  // maxWidth?: number
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<NotifyToastProps>(), {
  type: ModalType.None,
  title: '',
  message: '',
  code: '',
  actions: () => ModalActions.None,
  location: 'bottom center',
  timeout: 5000,
})

const emits = defineEmits<{
  confirm: [action: ModalAction]
}>()

const iconProps = computed(() => modalIconProps[props.type])

const modelValue = ref(true)
</script>

<template>
  <VueFinalModal
    style="display: none"
    :hide-overlay="true"
    :click-to-close="false"
    :esc-to-close="false"
  >
    <!-- @vue-expect-error: `close` is not typed but available -->
    <template #default="{ close }">
      <VSnackbar
        v-model="modelValue"
        color="surface"
        :timeout="props.timeout"
        :z-index="4000"
        @update:model-value="(v) => (v ? undefined : close())"
      >
        <VIcon v-if="is.plainObject(iconProps)" v-bind="iconProps" class="mr-4" />
        <template v-if="is.nonEmptyStringAndNotWhitespace(props.message)">
          {{ props.message }}
        </template>
        <slot v-else />
        <template v-if="props.actions.length > 0" #actions>
          <VBtn
            v-for="action in props.actions"
            :key="action"
            v-bind="modalActionButtonProps[action]"
            class="ml-2"
            variant="tonal"
            @click="emits('confirm', action)"
          />
        </template>
      </VSnackbar>
    </template>
  </VueFinalModal>
</template>
