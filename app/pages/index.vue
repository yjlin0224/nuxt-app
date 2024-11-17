<script setup lang="ts">
import {
  ConfirmDialogActions,
  ConfirmDialogType,
} from '@/components/global/Modal/ConfirmDialog.vue'

async function open() {
  const confirmation = useConfirmation({
    type: ConfirmDialogType.Warning,
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    actions: ConfirmDialogActions.YesNo,
    persistent: true,
  })
  console.log(await confirmation)
}
</script>

<template>
  <div>首頁</div>
  <VBtn @click="open()">Open Modal</VBtn>
</template>
