import type Pocketbase from 'pocketbase'

import equal from 'fast-deep-equal'
import {
  ClientResponseError,
  type CommonOptions,
  type ListResult,
  type RecordFullListOptions,
  type RecordListOptions,
  type RecordModel,
  type RecordOptions,
  type SendOptions,
  type RecordSubscription as _RecordSubscription,
} from 'pocketbase'

import {
  type BasePayload,
  type BaseRecord,
  type DataColumnConverter,
  type RecordId,
  mustBeStringEnum,
} from '~/composables/pocketbase/schemas/base'

export type RecordSubscriptionTopic = RecordId | '*'
export enum RecordSubscriptionAction {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}
export type RecordSubscription<T = RecordModel> = _RecordSubscription<T> & {
  action: RecordSubscriptionAction
  record: T
}

export default function usePocketbaseCollectionBase<
  TPayload extends BasePayload,
  TRecord extends BaseRecord,
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
  const service = database.collection<TPayload>(serviceKey)

  const isSoftDeleteSupported = dataColumnConverters.some(
    ({ payloadKey, recordKey }) => payloadKey === 'deleted' && recordKey === 'deletedAt',
  )

  function convertPayloadToRecord(payload: TPayload): TRecord {
    return Object.entries(payload).reduce((record, [key, value]) => {
      if (['collectionId', 'collectionName'].includes(key)) return record
      const { payloadToRecord } = dataColumnConverters.find(({ payloadKey }) => payloadKey === key)!
      return {
        ...record,
        ...payloadToRecord({ [key]: value }),
      }
    }, {} as TRecord)
  }

  function convertRecordToPayload(record: TRecord): TPayload {
    return Object.entries(record).reduce((payload, [key, value]) => {
      const { recordToPayload } = dataColumnConverters.find(({ recordKey }) => recordKey === key)!
      return {
        ...payload,
        ...recordToPayload({ [key]: value }),
      }
    }, {} as TPayload)
  }

  function makePayloadPatch(newRecord: TRecord, oldRecord?: TRecord): Partial<TPayload> {
    if (!is.plainObject(oldRecord)) return convertRecordToPayload(newRecord)
    const newPayload = convertRecordToPayload(newRecord)
    const oldPayload = convertRecordToPayload(oldRecord)
    return Object.entries(newPayload).reduce((patch, [key, value]) => {
      if (!equal(value, oldPayload[key as keyof TPayload])) {
        return { ...patch, [key]: value }
      }
      return patch
    }, {} as Partial<TPayload>)
  }

  async function getAll(queryParams?: RecordFullListOptions): Promise<TRecord[]> {
    const payloads = await service.getFullList(queryParams)
    return payloads.map(convertPayloadToRecord)
  }

  async function getMany(
    queryParams: NonNullableProperty<RecordListOptions, 'page' | 'perPage'>,
  ): Promise<ListResult<TRecord>> {
    const payloadListResult = await service.getList(
      queryParams.page,
      queryParams.perPage,
      queryParams,
    )
    return {
      ...payloadListResult,
      items: payloadListResult.items.map(convertPayloadToRecord),
    }
  }

  async function getFirst(
    queryParams: NonNullableProperty<RecordListOptions, 'filter'>,
  ): Promise<TRecord | null> {
    try {
      const payload = await service.getFirstListItem(queryParams.filter, queryParams)
      return convertPayloadToRecord(payload)
    } catch (error) {
      if (error instanceof ClientResponseError && error.status === 404) {
        return null
      }
      throw error
    }
  }

  async function getById(id: RecordId, queryParams?: RecordOptions): Promise<TRecord> {
    const payload = await service.getOne(id, queryParams)
    return convertPayloadToRecord(payload)
  }

  async function add(record: TRecord, queryParams?: RecordOptions): Promise<TRecord> {
    const payload = convertRecordToPayload(record)
    const addedPayload = await service.create(payload, queryParams)
    return convertPayloadToRecord(addedPayload)
  }

  async function update(
    newRecord: TRecord,
    oldRecord?: TRecord,
    queryParams?: RecordOptions,
  ): Promise<TRecord> {
    assert.truthy(newRecord.id === (oldRecord?.id ?? newRecord.id))
    const payloadPatch = makePayloadPatch(newRecord, oldRecord)
    const updatedPayload = await service.update(newRecord.id, payloadPatch, queryParams)
    return convertPayloadToRecord(updatedPayload)
  }

  async function removeById(
    id: RecordId,
    options?: { permanently: boolean } & CommonOptions,
  ): Promise<TRecord | null> {
    const permanently = isSoftDeleteSupported ? (options?.permanently ?? false) : true
    if (!permanently) {
      try {
        await service.delete(id, options)
      } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) {
          return null
        }
        throw error
      }
      return null
    }
    const deletedAtColumnConverter = dataColumnConverters.find(
      ({ payloadKey, recordKey }) => payloadKey === 'deleted' && recordKey === 'deletedAt',
    )!
    const payloadPatch = deletedAtColumnConverter.recordToPayload({ deletedAt: DateTime.now() })
    const updatedPayload = await service.update(id, payloadPatch)
    return convertPayloadToRecord(updatedPayload)
  }

  async function subscribe(
    topic: RecordSubscriptionTopic,
    callback: (data: RecordSubscription<TRecord>) => void,
    options?: SendOptions,
  ) {
    return service.subscribe(
      topic,
      ({ action, record }) => {
        callback({
          action: mustBeStringEnum(action, RecordSubscriptionAction),
          record: convertPayloadToRecord(record),
        })
      },
      options,
    )
  }

  async function unsubscribe(topic: RecordId | '*') {
    return service.unsubscribe(topic)
  }

  return {
    isBase: true as const,
    isAuth: false,
    database,
    service,
    dataColumnConverters,
    isSoftDeleteSupported,
    convertPayloadToRecord,
    convertRecordToPayload,
    makePayloadPatch,
    getAll,
    getMany,
    getFirst,
    getById,
    add,
    update,
    removeById,
    subscribe,
    unsubscribe,
  }
}
