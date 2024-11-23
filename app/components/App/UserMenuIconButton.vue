<script setup lang="ts">
import { ModalAction, ModalActions, ModalType } from '~/components/global/Modal/props'
import usePocketbaseStores from '~/stores/pocketbase'

const userStore = usePocketbaseStores.user()

const requests = {
  signOut: {
    requesting: ref(false),
    call: signOut,
  },
}

async function signOut() {
  requests.signOut.requesting.value = true
  const result = await useConfirmation({
    type: ModalType.Warning,
    title: '確認登出',
    message: '確定要登出嗎？\n登出後將會自動跳轉到註冊／登入頁面。',
    actions: ModalActions.YesNo,
  })
  if (result === ModalAction.Yes) {
    await userStore.removeAuth()
  }
  requests.signOut.requesting.value = false
}
</script>

<template>
  <VBtn
    v-tooltip:bottom="'使用者資訊'"
    class="app--user-menu-icon-button"
    icon
    :loading="requests.signOut.requesting.value"
    :disabled="!userStore.isAuthed"
  >
    <VAvatar :color="userStore.isAuthed ? 'white' : 'primary'">
      <template v-if="is.plainObject(userStore.authedRecord)">
        <VImg
          v-if="is.string(userStore.authedRecord.avatar)"
          :src="userStore.getFileUrl(userStore.authedRecord, 'avatar')!"
        />
        <IdentityIcon
          v-else
          :identity="userStore.authedRecord.email ?? userStore.authedRecord.username"
        />
      </template>
      <VIcon v-else>mdi-account-question</VIcon>
    </VAvatar>
    <VMenu activator="parent" :close-on-content-click="false">
      <VCard
        v-if="is.plainObject(userStore.authedRecord)"
        :title="
          is.nonEmptyStringAndNotWhitespace(userStore.authedRecord.name)
            ? userStore.authedRecord.name
            : '(無名氏)'
        "
        :subtitle="`@${userStore.authedRecord.username}`"
      >
        <template #prepend>
          <VAvatar color="white" border :size="48">
            <VTooltip
              v-if="is.string(userStore.authedRecord.email)"
              activator="parent"
              location="bottom"
            >
              {{ userStore.authedRecord.email }}
            </VTooltip>
            <VImg
              v-if="is.string(userStore.authedRecord.avatar)"
              :src="userStore.getFileUrl(userStore.authedRecord, 'avatar')!"
            />
            <IdentityIcon
              v-else
              :identity="userStore.authedRecord.email ?? userStore.authedRecord.username"
            />
          </VAvatar>
        </template>
        <template #append>
          <VBtn v-tooltip:bottom="'編輯'" icon variant="tonal">
            <VIcon>mdi-account-edit</VIcon>
            <UserEditDialog :id="userStore.authedRecord.id" activator="parent" />
          </VBtn>
        </template>
        <VDivider />
        <VCardActions>
          <VBtn
            block
            color="secondary"
            variant="tonal"
            prepend-icon="mdi-logout-variant"
            :loading="requests.signOut.requesting.value"
            @click="requests.signOut.call()"
          >
            登出
          </VBtn>
        </VCardActions>
      </VCard>
    </VMenu>
  </VBtn>
</template>
