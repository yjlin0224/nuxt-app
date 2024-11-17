import type { AuthPayload, AuthRecord } from '@/composables/pocketbase/schemas/auth'
import type { DataColumnConverter, RecordId } from '@/composables/pocketbase/schemas/base'
import type {
  AuthMethodsList,
  CommonOptions,
  ExternalAuthModel,
  RecordAuthResponse,
  RecordOptions,
  RecordService,
} from 'pocketbase'

import usePocketbaseCollectionBase from '@/composables/pocketbase/collections/base'

type OAuth2Provider =
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

export default function usePbCollectionAuth<
  TPayload extends AuthPayload,
  TRecord extends AuthRecord,
>(
  service: RecordService<TPayload>,
  dataColumnConverters: DataColumnConverter<
    // @ts-expect-error(2344): probably a bug in TypeScript
    keyof TPayload,
    keyof TRecord,
    unknown,
    unknown
  >[],
) {
  const base = usePocketbaseCollectionBase(service, dataColumnConverters)

  async function authWithPassword(
    usernameOrEmail: string,
    password: string,
    options?: RecordOptions,
  ): Promise<RecordAuthResponse<TRecord>> {
    const response = await service.authWithPassword(usernameOrEmail, password, options)
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
