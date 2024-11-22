import type {
  AuthMethodsList,
  CommonOptions,
  ExternalAuthModel,
  RecordAuthResponse,
  RecordOptions,
} from 'pocketbase'
import type Pocketbase from 'pocketbase'
import type { AuthPayload, AuthRecord } from '~/composables/pocketbase/schemas/auth'
import type {
  DataColumnConverter,
  RecordId,
  WithoutBaseRecord,
} from '~/composables/pocketbase/schemas/base'

import { blake3 } from 'hash-wasm'

import usePocketbaseCollectionBase from '~/composables/pocketbase/collections/base'

export type OAuth2Provider =
  | 'apple'
  | 'bitbucket'
  | 'discord'
  | 'facebook'
  | 'gitea'
  | 'gitee'
  | 'github'
  | 'gitlab'
  | 'google'
  | 'instagram'
  | 'kakao'
  | 'livechat'
  | 'mailcow'
  | 'microsoft'
  | 'oidc'
  | 'oidc2'
  | 'oidc3'
  | 'patreon'
  | 'planningcenter'
  | 'spotify'
  | 'strava'
  | 'twitch'
  | 'twitter'
  | 'vk'
  | 'yandex'

export type AuthAddPasswordPayload = {
  password: string
  passwordConfirm: string
}

export type AuthUpdatePasswordPayload = {
  oldPassword: string
  password: string
  passwordConfirm: string
}

export default function usePocketbaseCollectionAuth<
  TPayload extends AuthPayload,
  TRecord extends AuthRecord,
>(
  database: Pocketbase,
  serviceKey: string,
  dataColumnConverters: DataColumnConverter<
    // @ts-expect-error(2344): probably a bug in TypeScript
    keyof TPayload,
    keyof TRecord,
    unknown,
    unknown
  >[],
) {
  const base = usePocketbaseCollectionBase(database, serviceKey, dataColumnConverters)
  const { service } = base

  async function hashPasswordPayload<T extends AuthAddPasswordPayload | AuthUpdatePasswordPayload>(
    payload: T,
  ): Promise<T> {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(payload).map(async ([key, value]) => [key, await blake3(value)]),
      ),
    ) as T
  }

  async function add(
    record: WithoutBaseRecord<TRecord>,
    passwordPayload: AuthAddPasswordPayload,
    queryParams?: RecordOptions,
  ): Promise<TRecord> {
    const hashedPasswordPayload = await hashPasswordPayload(passwordPayload)
    const payload = { ...base.convertRecordToPayload(record), ...hashedPasswordPayload }
    const addedPayload = await service.create(payload, queryParams)
    return base.convertPayloadToRecord(addedPayload)
  }

  async function update(
    id: RecordId,
    newRecord: WithoutBaseRecord<TRecord>,
    oldRecord?: WithoutBaseRecord<TRecord>,
    passwordPayload?: AuthUpdatePasswordPayload,
    queryParams?: RecordOptions,
  ): Promise<TRecord> {
    const hashedPasswordPayload = passwordPayload ? await hashPasswordPayload(passwordPayload) : {}
    const payloadPatch = {
      ...base.makePayloadPatch(newRecord, oldRecord),
      ...hashedPasswordPayload,
    }
    const updatedPayload = await service.update(id, payloadPatch, queryParams)
    return base.convertPayloadToRecord(updatedPayload)
  }

  async function authWithPassword(
    usernameOrEmail: string,
    password: string,
    options?: RecordOptions,
  ): Promise<RecordAuthResponse<TRecord>> {
    const response = await service.authWithPassword(
      usernameOrEmail,
      await blake3(password),
      options,
    )
    return {
      ...response,
      record: base.convertPayloadToRecord(response.record),
    }
  }

  async function authWithOAuth2(
    provider: OAuth2Provider,
    code: string,
    codeVerifier: string,
    redirectUrl: string,
    createData?: Record<string, unknown>,
    options?: RecordOptions,
  ): Promise<RecordAuthResponse<TRecord>> {
    const response = await service.authWithOAuth2Code(
      provider,
      code,
      codeVerifier,
      redirectUrl,
      createData,
      options,
    )
    return {
      ...response,
      record: base.convertPayloadToRecord(response.record),
    }
  }

  async function authRefresh(options?: RecordOptions): Promise<RecordAuthResponse<TRecord>> {
    const response = await service.authRefresh(options)
    return {
      ...response,
      record: base.convertPayloadToRecord(response.record),
    }
  }

  async function requestVerification(email: string, options?: RecordOptions): Promise<void> {
    await service.requestVerification(email, options)
  }

  async function confirmVerification(token: string, options?: RecordOptions): Promise<void> {
    await service.confirmVerification(token, options)
    await service.authRefresh(options)
  }

  async function requestPasswordReset(email: string, options?: CommonOptions): Promise<void> {
    await service.requestPasswordReset(email, options)
  }

  async function confirmPasswordReset(token: string, password: string, options?: CommonOptions) {
    await service.confirmPasswordReset(token, password, password, options)
    await service.authRefresh(options as RecordOptions | undefined)
  }

  async function requestEmailChange(email: string, options?: CommonOptions): Promise<void> {
    await service.requestEmailChange(email, options)
  }

  async function confirmEmailChange(
    token: string,
    password: string,
    options?: CommonOptions,
  ): Promise<void> {
    await service.confirmEmailChange(token, password, options)
    await service.authRefresh(options as RecordOptions | undefined)
  }

  async function listAuthMethods(options?: CommonOptions): Promise<AuthMethodsList> {
    return service.listAuthMethods(options)
  }

  async function listExternalAuths(
    id: RecordId,
    options?: CommonOptions,
  ): Promise<ExternalAuthModel[]> {
    return service.listExternalAuths(id, options)
  }

  async function unlinkExternalAuth(
    id: RecordId,
    provider: OAuth2Provider,
    options?: CommonOptions,
  ): Promise<void> {
    await service.unlinkExternalAuth(id, provider, options)
  }

  return {
    ...base,
    isAuth: true as const,
    add,
    update,
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
}
