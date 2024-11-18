<script setup lang="ts">
import usePocketbaseStores from '~/stores/pocketbase'

definePageMeta({
  title: '使用者註冊／登入',
})

const userStore = usePocketbaseStores.user()

async function signIn() {
  await userStore.authWithPassword('test', '00000000')
}

function toRoot() {
  navigateTo('/')
}
</script>

<template>
  <div>
    <pre>isAuthed {{ userStore.isAuthed }}</pre>
    <pre>authedRecord {{ userStore.authedRecord }}</pre>
    <pre>authToken {{ userStore.authToken }}</pre>
    <VBtn @click="signIn()">Sign In</VBtn>
    <VBtn @click="toRoot()">To Root</VBtn>
  </div>
</template>
