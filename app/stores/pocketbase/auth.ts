import type {
  AuthMethodsList,
  CommonOptions,
  ExternalAuthModel,
  RecordAuthResponse,
  RecordOptions,
} from 'pocketbase'
import type { PocketbaseSchemaAuthKey } from '~/composables/pocketbase/collections'
import type usePocketbaseAuth from '~/composables/pocketbase/collections/auth'
import type { OAuth2Provider } from '~/composables/pocketbase/collections/auth'
import type { AuthPayload, AuthRecord } from '~/composables/pocketbase/schemas/auth'
import type { RecordId } from '~/composables/pocketbase/schemas/base'

import usePocketbaseCollections from '~/composables/pocketbase/collections'
import pocketbaseBaseStoreDefiner from '~/stores/pocketbase/base'

export default function pocketbaseAuthStoreDefiner<
  K extends PocketbaseSchemaAuthKey,
  TPayload extends AuthPayload,
  TRecord extends AuthRecord,
  TPocketbase extends ReturnType<typeof usePocketbaseAuth<TPayload, TRecord>>,
>(schemaKey: K) {
  const useBaseStore = pocketbaseBaseStoreDefiner<K, TPayload, TRecord, TPocketbase>(schemaKey)

  return defineStore(schemaKey, () => {
    const collection = usePocketbaseCollections[schemaKey]() as unknown as TPocketbase
    const baseStore = useBaseStore()

    function getAuthedRecord(): TRecord | null {
      const { token, model, isValid, isAuthRecord } = collection.database.authStore
      if (is.emptyStringOrWhitespace(token) || !isValid) {
        return null
      }
      if (!is.plainObject(model) || !isAuthRecord) {
        return null
      }
      const { collectionIdOrName } = collection.service
      if (![model['collectionName'], model['collectionId']].includes(collectionIdOrName)) {
        return null
      }
      return collection.convertPayloadToRecord(model as TPayload)
    }

    const authedRecord = ref(getAuthedRecord())
    const isAuthed = computed(() => is.plainObject(authedRecord.value))
    const authToken = ref(isAuthed.value ? collection.database.authStore.token : null)
    collection.database.authStore.onChange(() => {
      authedRecord.value = getAuthedRecord()
      authToken.value = isAuthed.value ? collection.database.authStore.token : null
    })

    function removeAuth() {
      collection.database.authStore.clear()
    }

    async function authWithPassword(
      usernameOrEmail: string,
      password: string,
      options?: RecordOptions,
    ): Promise<RecordAuthResponse<TRecord>> {
      return collection.authWithPassword(usernameOrEmail, password, options)
    }

    async function authWithOAuth2(
      provider: OAuth2Provider,
      code: string,
      codeVerifier: string,
      redirectUrl: string,
      createData?: Record<string, unknown>,
      options?: RecordOptions,
    ): Promise<RecordAuthResponse<TRecord>> {
      return collection.authWithOAuth2(
        provider,
        code,
        codeVerifier,
        redirectUrl,
        createData,
        options,
      )
    }

    async function authRefresh(options?: RecordOptions): Promise<RecordAuthResponse<TRecord>> {
      return collection.authRefresh(options)
    }

    async function requestVerification(email: string, options?: RecordOptions): Promise<void> {
      return collection.requestVerification(email, options)
    }

    async function confirmVerification(token: string, options?: RecordOptions): Promise<void> {
      return collection.confirmVerification(token, options)
    }

    async function requestPasswordReset(email: string, options?: CommonOptions): Promise<void> {
      return collection.requestPasswordReset(email, options)
    }

    async function confirmPasswordReset(token: string, password: string, options?: CommonOptions) {
      return collection.confirmPasswordReset(token, password, options)
    }

    async function requestEmailChange(email: string, options?: CommonOptions): Promise<void> {
      return collection.requestEmailChange(email, options)
    }

    async function confirmEmailChange(
      token: string,
      password: string,
      options?: CommonOptions,
    ): Promise<void> {
      return collection.confirmEmailChange(token, password, options)
    }

    async function listAuthMethods(options?: CommonOptions): Promise<AuthMethodsList> {
      return collection.listAuthMethods(options)
    }

    async function listExternalAuths(
      id: RecordId,
      options?: CommonOptions,
    ): Promise<ExternalAuthModel[]> {
      return collection.listExternalAuths(id, options)
    }

    async function unlinkExternalAuth(
      id: RecordId,
      provider: OAuth2Provider,
      options?: CommonOptions,
    ): Promise<void> {
      return collection.unlinkExternalAuth(id, provider, options)
    }

    return {
      ...baseStore,
      collection,
      authedRecord,
      isAuthed,
      authToken,
      clearAuth: removeAuth,
      authWithPassword,
      authWithOAuth2,
      authRefresh,
      requestVerification,
      confirmVerification,
      requestPasswordReset,
      confirmPasswordReset,
      requestEmailChange,
      confirmEmailChange,
      listAuthMethods,
      listExternalAuths,
      unlinkExternalAuth,
    }
  })
}
