<script setup lang="ts">
import type { UnionToIntersection } from 'type-fest'
import type { VDialog, VTextField } from 'vuetify/components'
import type { AuthUpdatePasswordPayload } from '~/composables/pocketbase/collections/auth'
import type { RecordId, WithoutBaseRecord } from '~/composables/pocketbase/schemas/base'
import type { UserRecord } from '~/composables/pocketbase/schemas/user'

import { ClientResponseError } from 'pocketbase'

import { ModalAction, ModalActions, ModalType } from '~/components/global/Modal/props'
import usePocketbaseStores from '~/stores/pocketbase'

const slots = defineSlots<VDialog['$slots']>()

type EditDialogProps = {
  activator?: VDialog['$props']['activator']
  id: RecordId
}

const props = defineProps<EditDialogProps>()
const model = defineModel<VDialog['$props']['modelValue']>()

const userStore = usePocketbaseStores.user()

const { data, status, error, refresh, clear } = await useAsyncData('user', () =>
  userStore.getById(props.id),
)

watch(
  () => status.value,
  (newValue) => {
    if (newValue === 'error') {
      useNotification({
        type: ModalType.Error,
        message: `讀取失敗：${error.value?.message}`,
        actions: ModalActions.Ok,
      })
      closeDialog()
    }
  },
)

watch(
  () => model.value,
  async (newValue) => (newValue ? await refreshForm() : clear()),
)

watch(
  () => props.id,
  async () => {
    clear()
    await refreshForm()
  },
)

const formVisibilities: ChangeValueType<AuthUpdatePasswordPayload, Ref<boolean>> = {
  oldPassword: ref(false),
  password: ref(false),
  passwordConfirm: ref(false),
}

const formNeedChangePassword = ref(false)

watch(
  () => formNeedChangePassword.value,
  () => {
    const keys = Object.keys(formVisibilities) as (keyof typeof formVisibilities)[]
    keys.forEach((key) => {
      formVisibilities[key].value = false
      formFields[key].value = ''
    })
  },
)

type FormTemplate<T = string> = {
  username: T
  email: T
  name: T
  oldPassword: T
  password: T
  passwordConfirm: T
}

type FormValidationSchema = ReturnType<typeof yup.object<object, FormTemplate<yup.StringSchema>>>

const formValidationSchema = computed<FormValidationSchema>(() => {
  const empty = yup.string().oneOf([''], '必須是空字串')
  const optional = yup
    .string()
    .test('is-trimmed', '字串頭尾不能有空白字元', (value) => (value ?? '').trim() === value)
  const required = yup.string().required('必填的').concat(optional)
  const username = yup
    .string()
    .matches(/^\w[\w.]*$/, '使用者帳號只能使用0~9、A~Z、a~z、_、.且頭不能是.')
    .min(3, '使用者帳號最少需要3個字元')
    .max(150, '使用者帳號最多只能150個字元')
  const email = yup.string().test('is-email', '電子郵件地址的格式無效', isExistingEmail)
  const password = yup
    .string()
    .matches(/^[\x20-\x7e]+$/, '只能使用0~9、A~Z、a~z和常見的標點符號')
    .min(8, '密碼至少需要8個字元')
  const oldPassword = password.notOneOf([yup.ref('password')], '新舊密碼不能相同')
  const passwordConfirm = password.oneOf([yup.ref('password')], '密碼不相符')
  return yup.object({
    username: required.concat(username),
    email: optional.concat(email),
    name: optional,
    oldPassword: formNeedChangePassword.value ? required.concat(oldPassword) : empty,
    password: formNeedChangePassword.value ? required.concat(password) : empty,
    passwordConfirm: formNeedChangePassword.value ? required.concat(passwordConfirm) : empty,
  })
})

type Form = ReturnType<typeof useForm<FormTemplate>>

function getFormInitialValues() {
  return {
    username: data.value?.username ?? '',
    email: data.value?.email ?? '',
    name: data.value?.name ?? '',
    oldPassword: '',
    password: '',
    passwordConfirm: '',
  }
}

const form: Form = useForm({
  initialValues: getFormInitialValues(),
  validationSchema: formValidationSchema,
  validateOnMount: true,
})

const formFields: FormTemplate<Ref<string>> = R.pipe(
  form.values,
  R.mapValues((_, key) => form.defineField(key)[0]),
)

type FormInputProps = FormTemplate<VTextField['$props']>

const formInputProps = computed<FormInputProps>(() => {
  const username: VTextField['$props'] = {
    id: 'username',
    type: 'text',
    name: 'username',
    label: '使用者名稱 *',
    prependInnerIcon: 'mdi-account',
  }
  const name: VTextField['$props'] = {
    id: 'name',
    type: 'text',
    name: 'name',
    label: '名字',
    prependInnerIcon: 'mdi-badge-account-horizontal',
  }
  const email: VTextField['$props'] = {
    id: 'email',
    type: 'email',
    name: 'email',
    label: '電子郵件地址',
    prependInnerIcon: 'mdi-email',
  }
  const oldPassword: VTextField['$props'] = {
    id: 'old-password',
    type: 'password',
    name: 'old-password',
    label: '舊密碼 *',
    prependInnerIcon: 'mdi-lock',
  }
  const password: VTextField['$props'] = {
    id: 'password',
    type: 'password',
    name: 'password',
    label: '新密碼 *',
    prependInnerIcon: 'mdi-lock',
  }
  const passwordConfirm: VTextField['$props'] = {
    id: 'password-confirm',
    type: 'password',
    name: 'password-confirm',
    label: '確認密碼 *',
    prependInnerIcon: 'mdi-lock-check',
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
  const props: FormInputProps = {
    username,
    name: {
      ...name,
      ...generateClearable(formFields.name),
    },
    email: {
      ...email,
      ...generateClearable(formFields.email),
    },
    oldPassword: {
      ...oldPassword,
      ...generateClearable(formFields.oldPassword),
      ...generateVisibility(formVisibilities.oldPassword),
    },
    password: {
      ...password,
      ...generateClearable(formFields.oldPassword),
      ...generateVisibility(formVisibilities.password),
    },
    passwordConfirm: {
      ...passwordConfirm,
      ...generateClearable(formFields.oldPassword),
      ...generateVisibility(formVisibilities.passwordConfirm),
    },
  }
  return props
})

const formSubmit = form.handleSubmit(submit)

async function submit(formData: FormTemplate) {
  if (!is.plainObject(data.value)) return
  try {
    const passwordPayloadKeys = Object.keys(formVisibilities) as (keyof AuthUpdatePasswordPayload)[]
    const record: WithoutBaseRecord<UserRecord> = R.omit({ ...data.value, ...formData }, [
      'id',
      'createdAt',
      'updatedAt',
      ...passwordPayloadKeys,
    ])
    const passwordPayload = formNeedChangePassword.value
      ? (R.pick(formData, passwordPayloadKeys) as AuthUpdatePasswordPayload)
      : undefined
    const result = formNeedChangePassword.value
      ? await useConfirmation({
        type: ModalType.Warning,
        title: '更新密碼',
        message: '確定要更新密碼嗎？更新密碼後將會自動登出。',
        actions: ModalActions.OkCancel,
      })
      : ModalAction.Ok
    if (result === ModalAction.Ok) {
      data.value = await userStore.update(props.id, record, data.value, passwordPayload)
      closeDialog()
    }
  } catch (error) {
    if (error instanceof ClientResponseError && checkStatusCodeLevel(error.status, 4)) {
      useNotification({
        type: ModalType.Error,
        message: `提交失敗：[${error.status}] ${error.message}`,
        actions: ModalActions.Ok,
      })
    } else {
      throw error
    }
  } finally {
    const { oldPassword, password, passwordConfirm } = formFields
    oldPassword.value = ''
    password.value = ''
    passwordConfirm.value = ''
    formVisibilities.oldPassword.value = false
    formVisibilities.password.value = false
    formVisibilities.passwordConfirm.value = false
  }
}

async function refreshForm() {
  await refresh()
  form.resetForm({ values: getFormInitialValues() })
}

async function closeDialog() {
  model.value = false
}
</script>

<template>
  <VDialog v-model="model" class="user--edit-dialog" :width="400" :activator="props.activator">
    <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps as UnionToIntersection<typeof slotProps>" />
    </template>
    <VCard>
      <VToolbar color="surface">
        <template #prepend>
          <VIcon>mdi-pencil</VIcon>
        </template>
        <template #append>
          <VBtn icon="mdi-close" :disabled="form.isSubmitting.value" @click="closeDialog()" />
        </template>
        <VToolbarTitle>編輯使用者</VToolbarTitle>
        <VProgressLinear
          :active="status === 'pending'"
          :indeterminate="status === 'pending'"
          color="primary"
          absolute
        />
      </VToolbar>
      <VForm
        id="form--user-edit"
        :disabled="form.isSubmitting.value || status !== 'success'"
        @submit.prevent="formSubmit($event)"
      >
        <VCardText>
          <VRow>
            <VCol>
              <VTextField
                v-model="formFields.username.value"
                v-bind="formInputProps.username"
                :error-messages="form.errors.value.username"
              />
            </VCol>
            <VCol>
              <VTextField
                v-model="formFields.name.value"
                v-bind="formInputProps.name"
                :error-messages="form.errors.value.name"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="formFields.email.value"
                v-bind="formInputProps.email"
                :error-messages="form.errors.value.email"
              />
            </VCol>
          </VRow>
          <VDivider />
          <VRow>
            <VCol>
              <VSwitch
                v-model="formNeedChangePassword"
                label="更改密碼"
                hide-details
                color="primary"
                density="comfortable"
                :disabled="form.isSubmitting.value"
              />
            </VCol>
          </VRow>
          <template v-if="formNeedChangePassword">
            <VRow>
              <VCol>
                <VTextField
                  v-model="formFields.oldPassword.value"
                  v-bind="formInputProps.oldPassword"
                  :error-messages="form.errors.value.oldPassword"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol>
                <VTextField
                  v-model="formFields.password.value"
                  v-bind="formInputProps.password"
                  :error-messages="form.errors.value.password"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol>
                <VTextField
                  v-model="formFields.passwordConfirm.value"
                  v-bind="formInputProps.passwordConfirm"
                  :error-messages="form.errors.value.passwordConfirm"
                />
              </VCol>
            </VRow>
          </template>
        </VCardText>
        <VDivider />
        <VCardActions>
          <VBtn
            color="warning"
            variant="tonal"
            prepend-icon="mdi-reload"
            :disabled="form.isSubmitting.value"
            @click="refreshForm()"
          >
            重設
          </VBtn>
          <VSpacer />
          <VBtn
            color="error"
            variant="tonal"
            prepend-icon="mdi-cancel"
            :disabled="form.isSubmitting.value"
            @click="closeDialog()"
          >
            取消
          </VBtn>
          <VBtn
            color="primary"
            variant="flat"
            type="submit"
            prepend-icon="mdi-send"
            :disabled="!form.meta.value.valid"
            :loading="form.isSubmitting.value"
          >
            提交
          </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>
