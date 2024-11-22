<script setup lang="ts">
import type { VTextField } from 'vuetify/components'
import type { AuthAddPasswordPayload } from '~/composables/pocketbase/collections/auth'
import type { WithoutBaseRecord } from '~/composables/pocketbase/schemas/base'
import type { UserRecord } from '~/composables/pocketbase/schemas/user'

import { ClientResponseError } from 'pocketbase'
import { useForm } from 'vee-validate'

import { ModalActions, ModalType } from '~/components/global/Modal/props'
import usePocketbaseStores from '~/stores/pocketbase'

definePageMeta({
  title: '使用者註冊／登入',
})

const route = useRoute()
const userStore = usePocketbaseStores.user()

const checkingAuth = ref(true)

watch(
  () => userStore.isAuthed && !checkingAuth.value,
  async (newValue) => {
    if (newValue) {
      navigateTo({
        path: is.nonEmptyStringAndNotWhitespace(route.query.redirect) ? route.query.redirect : '/',
      })
    } else {
      await goNextAuthWindowItem(AuthWindowItem.CheckUserExists, false)
    }
  },
)

enum AuthWindowItem {
  CheckUserExists = 'check-user-exists',
  RegisterAndSignIn = 'register-and-sign-in',
  SignIn = 'sign-in',
}

const authWindow = {
  currentItem: ref(AuthWindowItem.CheckUserExists),
  items: ref([AuthWindowItem.CheckUserExists]),
}

async function goPreviousAuthWindowItem() {
  const { currentItem, items } = authWindow
  if (items.value.length <= 1) {
    return
  }
  const previousItem = items.value[items.value.length - 2]
  if (!is.string(previousItem)) {
    return
  }
  currentItem.value = previousItem
  await nextTick()
  items.value.pop()
}

async function goNextAuthWindowItem(nextItem: AuthWindowItem, canGoPrevious = true) {
  const { currentItem, items } = authWindow
  items.value = [...items.value, nextItem]
  await nextTick()
  await delay(1)
  currentItem.value = nextItem
  if (!canGoPrevious) {
    await nextTick()
    await delay(1)
    items.value = [nextItem]
  }
}

const authWindowItemTitles: { [key in AuthWindowItem]: string } = {
  [AuthWindowItem.CheckUserExists]: '輸入使用者名稱或信箱',
  [AuthWindowItem.SignIn]: '輸入密碼',
  [AuthWindowItem.RegisterAndSignIn]: '註冊帳號',
}

const authWindowItemSubmitButtonLabels: { [key in AuthWindowItem]: string } = {
  [AuthWindowItem.CheckUserExists]: '下一步',
  [AuthWindowItem.SignIn]: '登入',
  [AuthWindowItem.RegisterAndSignIn]: '註冊並登入',
}

const formVisibilities = {
  password: ref(false),
  passwordConfirm: ref(false),
}

type FormTemplateOfAuthWindowItems<T = string> = {
  [AuthWindowItem.CheckUserExists]: {
    usernameOrEmail: T
  }
  [AuthWindowItem.SignIn]: {
    usernameOrEmail: T
    password: T
  }
  [AuthWindowItem.RegisterAndSignIn]: {
    username: T
    email: T
    password: T
    passwordConfirm: T
    name: T
  }
}

type FormValidationSchemaOfAuthWindowItems = {
  [K in keyof FormTemplateOfAuthWindowItems]: ReturnType<
    typeof yup.object<object, FormTemplateOfAuthWindowItems<yup.StringSchema>[K]>
  >
}

const formValidationSchemaOfAuthWindowItems = computed<FormValidationSchemaOfAuthWindowItems>(
  () => {
    const optional = yup
      .string()
      .test('is-trimmed', '字串頭尾不能有空白字元', (value) => (value ?? '').trim() === value)
    const required = yup.string().required('必填的').concat(optional)
    const username = yup
      .string()
      .matches(/^\w[\w.]*$/, '使用者帳號只能使用0~9、A~Z、a~z、_、.且頭不能是.')
      .min(3, '使用者帳號最少需要3個字元')
      .max(150, '使用者帳號最多只能150個字元')
    const email = yup.string().test('is-email', '電子信箱的格式無效', isExistingEmail)
    const usernameOrEmail = yup
      .string()
      .test('is-email', '電子信箱的格式無效', (value) =>
        (value ?? '').includes('@') ? isExistingEmail(value) : true,
      )
      .test('is-username', '使用者帳號的格式無效', (value) =>
        (value ?? '').includes('@') ? true : username.isValidSync(value),
      )
    const password = yup
      .string()
      .matches(/^[\x20-\x7e]+$/, '只能使用0~9、A~Z、a~z和常見的標點符號')
      .min(8, '密碼至少需要8個字元')
    const passwordConfirm = password.oneOf([yup.ref('password')], '密碼不相符')
    return {
      [AuthWindowItem.CheckUserExists]: yup.object({
        usernameOrEmail: required.concat(usernameOrEmail),
      }),
      [AuthWindowItem.SignIn]: yup.object({
        usernameOrEmail: required.concat(usernameOrEmail),
        password: required.concat(password),
      }),
      [AuthWindowItem.RegisterAndSignIn]: yup.object({
        username: required.concat(username),
        email: optional.concat(email),
        password: required.concat(password),
        passwordConfirm: required.concat(passwordConfirm),
        name: optional,
      }),
    }
  },
)

type FormOfAuthWindowItems = {
  [K in keyof FormTemplateOfAuthWindowItems]: ReturnType<
    typeof useForm<FormTemplateOfAuthWindowItems[K]>
  >
}

const formOfAuthWindowItems: FormOfAuthWindowItems = {
  [AuthWindowItem.CheckUserExists]: useForm({
    initialValues: {
      usernameOrEmail: '',
    },
    validationSchema: formValidationSchemaOfAuthWindowItems.value[AuthWindowItem.CheckUserExists],
    validateOnMount: true,
  }),
  [AuthWindowItem.SignIn]: useForm({
    initialValues: {
      usernameOrEmail: '',
      password: '',
    },
    validationSchema: formValidationSchemaOfAuthWindowItems.value[AuthWindowItem.SignIn],
    validateOnMount: true,
  }),
  [AuthWindowItem.RegisterAndSignIn]: useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
    },
    validationSchema: formValidationSchemaOfAuthWindowItems.value[AuthWindowItem.RegisterAndSignIn],
    validateOnMount: true,
  }),
}

const formFieldsOfAuthWindowItems: FormTemplateOfAuthWindowItems<Ref<string>> = R.pipe(
  formOfAuthWindowItems,
  R.mapValues((form) =>
    R.pipe(
      form.values,
      R.mapValues(
        (_, key) =>
          // @ts-expect-error: TypeScript cannot resolve the type of `key`
          form.defineField(key)[0],
      ),
    ),
  ),
) as FormTemplateOfAuthWindowItems<Ref<string>>

type FormInputPropsOfAuthWindowItems = FormTemplateOfAuthWindowItems<VTextField['$props']>

const formInputPropsOfAuthWindowItems = computed<FormInputPropsOfAuthWindowItems>(() => {
  const username: VTextField['$props'] = {
    id: 'username',
    type: 'text',
    name: 'username',
    label: '使用者名稱 *',
    prependInnerIcon: 'mdi-account',
  }
  const email: VTextField['$props'] = {
    id: 'email',
    type: 'email',
    name: 'email',
    label: '信箱',
    prependInnerIcon: 'mdi-email',
  }
  const password: VTextField['$props'] = {
    id: 'password',
    type: 'password',
    name: 'password',
    label: '密碼 *',
    prependInnerIcon: 'mdi-lock',
  }
  const passwordConfirm: VTextField['$props'] = {
    id: 'password-confirm',
    type: 'password',
    name: 'password-confirm',
    label: '確認密碼 *',
    prependInnerIcon: 'mdi-lock-check',
  }
  const name: VTextField['$props'] = {
    id: 'name',
    type: 'text',
    name: 'name',
    label: '名字',
    prependInnerIcon: 'mdi-badge-account-horizontal',
  }
  const generateClearable = (field: Ref<string>): VTextField['$props'] => ({
    clearable: true,
    ...{
      'onClick:clear': () => {
        field.value = ''
      },
    },
  })
  const generateVisibility = (isVisible: Ref<boolean>): VTextField['$props'] => ({
    type: isVisible.value ? 'text' : 'password',
    appendInnerIcon: isVisible.value ? 'mdi-eye' : 'mdi-eye-off',
    ...{
      'onClick:appendInner': () => {
        isVisible.value = !isVisible.value
      },
    },
  })
  const props: FormInputPropsOfAuthWindowItems = {
    [AuthWindowItem.CheckUserExists]: {
      usernameOrEmail: {
        ...(formOfAuthWindowItems[AuthWindowItem.CheckUserExists].values.usernameOrEmail.includes(
          '@',
        )
          ? email
          : username),
        id: 'username-or-email',
        name: 'username-or-email',
        label: '使用者名稱或信箱 *',
        autofocus: true,
      },
    },
    [AuthWindowItem.SignIn]: {
      usernameOrEmail: {
        ...(formOfAuthWindowItems[AuthWindowItem.SignIn].values.usernameOrEmail.includes('@')
          ? email
          : username),
        id: 'username-or-email',
        name: 'username-or-email',
        label: '使用者名稱或信箱 *',
        readonly: true,
        hideDetails: true,
      },
      password: {
        ...password,
        ...generateClearable(formFieldsOfAuthWindowItems[AuthWindowItem.SignIn].password),
        ...generateVisibility(formVisibilities.password),
        autofocus: true,
      },
    },
    [AuthWindowItem.RegisterAndSignIn]: {
      username,
      email: {
        ...email,
        ...generateClearable(formFieldsOfAuthWindowItems[AuthWindowItem.RegisterAndSignIn].email),
      },
      password: {
        ...password,
        ...generateClearable(
          formFieldsOfAuthWindowItems[AuthWindowItem.RegisterAndSignIn].password,
        ),
        ...generateVisibility(formVisibilities.password),
      },
      passwordConfirm: {
        ...passwordConfirm,
        ...generateClearable(
          formFieldsOfAuthWindowItems[AuthWindowItem.RegisterAndSignIn].passwordConfirm,
        ),
        ...generateVisibility(formVisibilities.passwordConfirm),
      },
      name: {
        ...name,
        ...generateClearable(formFieldsOfAuthWindowItems[AuthWindowItem.RegisterAndSignIn].name),
      },
    },
  }
  return props
})

const formSubmitOfAuthWindowItems = {
  [AuthWindowItem.CheckUserExists]:
    formOfAuthWindowItems[AuthWindowItem.CheckUserExists].handleSubmit(checkUserExists),
  [AuthWindowItem.SignIn]: formOfAuthWindowItems[AuthWindowItem.SignIn].handleSubmit(signIn),
  [AuthWindowItem.RegisterAndSignIn]:
    formOfAuthWindowItems[AuthWindowItem.RegisterAndSignIn].handleSubmit(registerAndSignIn),
}

type AuthFormData<T extends AuthWindowItem> = (typeof formOfAuthWindowItems)[T]['values']

async function checkUserExists(formData: AuthFormData<AuthWindowItem.CheckUserExists>) {
  const { usernameOrEmail } = formData
  try {
    const userRecord = await userStore.getFirst({
      filter: `username="${usernameOrEmail}"||email="${usernameOrEmail}"`,
      for: 'auth',
    })
    const nextItem = is.plainObject(userRecord)
      ? AuthWindowItem.SignIn
      : AuthWindowItem.RegisterAndSignIn
    const form = formOfAuthWindowItems[nextItem]
    if (is.plainObject(userRecord) && nextItem === AuthWindowItem.SignIn) {
      form.setValues({ usernameOrEmail })
    } else if (nextItem === AuthWindowItem.RegisterAndSignIn) {
      const username = usernameOrEmail.includes('@')
        ? usernameOrEmail.split('@')[0]
        : usernameOrEmail
      const email = usernameOrEmail.includes('@') ? usernameOrEmail : ''
      form.setValues({ username, email })
    }
    await goNextAuthWindowItem(nextItem)
  } catch (error) {
    if (error instanceof ClientResponseError && checkStatusCodeLevel(error.status, 4)) {
      useNotification({
        type: ModalType.Error,
        message: `取得使用者失敗：[${error.status}] ${error.message}`,
        actions: ModalActions.Ok,
      })
    } else {
      throw error
    }
  }
}

async function signIn(formData: AuthFormData<AuthWindowItem.SignIn>) {
  const item = AuthWindowItem.SignIn
  const { usernameOrEmail, password } = formData
  try {
    await userStore.authWithPassword(usernameOrEmail, password)
  } catch (error) {
    if (error instanceof ClientResponseError && checkStatusCodeLevel(error.status, 4)) {
      useNotification({
        type: ModalType.Error,
        message: `登入失敗：[${error.status}] ${error.message}`,
        actions: ModalActions.Ok,
      })
    } else {
      throw error
    }
  } finally {
    const { password } = formFieldsOfAuthWindowItems[item]
    password.value = ''
    formVisibilities.password.value = false
  }
}

async function registerAndSignIn(formData: AuthFormData<AuthWindowItem.RegisterAndSignIn>) {
  const item = AuthWindowItem.RegisterAndSignIn
  try {
    const record: WithoutBaseRecord<UserRecord> = {
      ...R.omit(formData, ['password', 'passwordConfirm']),
      email: is.nonEmptyStringAndNotWhitespace(formData.email) ? formData.email : null,
      emailVisibility: true,
      verified: false,
      avatar: null,
    }
    const passwordPayload: AuthAddPasswordPayload = {
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
    }
    await userStore.add(record, passwordPayload)
    await userStore.authWithPassword(record.username, passwordPayload.password)
  } catch (error) {
    if (error instanceof ClientResponseError && checkStatusCodeLevel(error.status, 4)) {
      useNotification({
        type: ModalType.Error,
        message: `登入失敗：[${error.status}] ${error.message}`,
        actions: ModalActions.Ok,
      })
    } else {
      throw error
    }
  } finally {
    const { password, passwordConfirm } = formFieldsOfAuthWindowItems[item]
    password.value = ''
    passwordConfirm.value = ''
    formVisibilities.password.value = false
    formVisibilities.passwordConfirm.value = false
  }
}

// TODO: maybe change to useAsyncData
async function checkAlreadySignedIn() {
  try {
    await userStore.authRefresh()
  } catch (error) {
    if (error instanceof ClientResponseError && checkStatusCodeLevel(error.status, 4)) {
      if (error.status === 401) {
        return
      }
      useNotification({
        type: ModalType.Error,
        message: `需要重新登入：[${error.status}] ${error.message}`,
        actions: ModalActions.Ok,
      })
    } else {
      throw error
    }
  } finally {
    checkingAuth.value = false
  }
}

onMounted(async () => {
  await checkAlreadySignedIn()
})
</script>

<template>
  <VContainer id="page--user-auth" class="fill-height" fluid>
    <VCard class="mx-auto" :width="400">
      <VWindow v-model="authWindow.currentItem.value">
        <template v-for="(item, _, i) in AuthWindowItem" :key="i">
          <VWindowItem v-if="authWindow.items.value.includes(item)" :value="item">
            <VToolbar>
              <template #prepend>
                <VBtn
                  icon="mdi-arrow-left"
                  :disabled="authWindow.items.value.indexOf(item) === 0"
                  @click="goPreviousAuthWindowItem()"
                />
              </template>
              <VToolbarTitle>
                {{ checkingAuth ? '檢查登入狀態…' : authWindowItemTitles[item] }}
              </VToolbarTitle>
              <VProgressLinear
                :active="checkingAuth"
                :indeterminate="checkingAuth"
                color="primary"
                absolute
              />
            </VToolbar>
            <VForm
              :id="`form--${item}`"
              :disabled="
                formOfAuthWindowItems[item].isSubmitting.value || checkingAuth || userStore.isAuthed
              "
              @submit.prevent="formSubmitOfAuthWindowItems[item]($event)"
            >
              <VCardText>
                <template
                  v-if="item === AuthWindowItem.CheckUserExists || item === AuthWindowItem.SignIn"
                >
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].usernameOrEmail.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].usernameOrEmail"
                        :error-messages="formOfAuthWindowItems[item].errors.value.usernameOrEmail"
                      />
                    </VCol>
                  </VRow>
                </template>
                <template v-if="item === AuthWindowItem.SignIn">
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].password.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].password"
                        :error-messages="formOfAuthWindowItems[item].errors.value.password"
                      />
                    </VCol>
                  </VRow>
                </template>
                <template v-if="item === AuthWindowItem.RegisterAndSignIn">
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].username.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].username"
                        :error-messages="formOfAuthWindowItems[item].errors.value.username"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].email.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].email"
                        :error-messages="formOfAuthWindowItems[item].errors.value.email"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].password.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].password"
                        :error-messages="formOfAuthWindowItems[item].errors.value.password"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].passwordConfirm.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].passwordConfirm"
                        :error-messages="formOfAuthWindowItems[item].errors.value.passwordConfirm"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VTextField
                        v-model="formFieldsOfAuthWindowItems[item].name.value"
                        v-bind="formInputPropsOfAuthWindowItems[item].name"
                        :error-messages="formOfAuthWindowItems[item].errors.value.name"
                      />
                    </VCol>
                  </VRow>
                </template>
              </VCardText>
              <VDivider />
              <VCardActions>
                <VSpacer />
                <VBtn
                  color="primary"
                  variant="flat"
                  type="submit"
                  :disabled="!formOfAuthWindowItems[item].meta.value.valid"
                  :loading="formOfAuthWindowItems[item].isSubmitting.value"
                >
                  {{ authWindowItemSubmitButtonLabels[item] }}
                </VBtn>
              </VCardActions>
            </VForm>
          </VWindowItem>
        </template>
      </VWindow>
    </VCard>
  </VContainer>
</template>
