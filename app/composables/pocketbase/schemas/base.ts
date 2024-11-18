import type { BaseModel } from 'pocketbase'

export type RecordId = Branded<string>

export type ConvertToType<T extends Record<string, unknown>, K extends keyof T, V> = Omit<T, K> & {
  [L in K]: V
}
export type ConvertToNullable<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> & {
  [L in K]: T[L] | null
}
export type ConvertToDateTimeWithSuffix<
  T extends Record<string, unknown>,
  K extends keyof T,
> = Omit<T, K> & {
  [L in K as `${string & K}At`]: DateTime
}
export type ConvertToNullableDateTimeWithSuffix<
  T extends Record<string, unknown>,
  K extends keyof T,
> = Omit<T, K> & {
  [L in K as `${string & K}At`]: DateTime
}

export type BasePayload = RemoveIndexSignature<BaseModel>
export type BaseRecord = ConvertToDateTimeWithSuffix<
  ConvertToType<BasePayload, 'id', RecordId>,
  'created' | 'updated'
>

export type WithBasePayload<T extends Record<string, unknown>> = BasePayload &
  Omit<T, keyof BasePayload>
export type WithBaseRecord<T extends Record<string, unknown>> = BaseRecord &
  Omit<T, keyof BasePayload>

export function isRecordId(value: unknown): value is RecordId {
  // https://github.com/pocketbase/pocketbase/tree/master/models/base.go
  return is.string(value) && (/^[A-Za-z\d]{15}$/.test(value) || /^\d+$/.test(value))
}

export function mustBeRecordId(value: unknown): RecordId {
  if (isRecordId(value)) return value
  throw new Error(`Invalid record ID: ${value}`)
}

export function mayBeRecordId(value: unknown): RecordId | null {
  if (!is.nonEmptyStringAndNotWhitespace(value)) return null
  return mustBeRecordId(value)
}

export function mustBeDateTime(value: unknown): DateTime {
  if (is.nonEmptyStringAndNotWhitespace(value)) {
    const dateTimeFromSql = DateTime.fromSQL(value)
    if (dateTimeFromSql.isValid) return dateTimeFromSql
    const dateTimeFromIso = DateTime.fromISO(value)
    if (dateTimeFromIso.isValid) return dateTimeFromIso
  }
  throw new Error(`Invalid date time: ${value}`)
}

export function mayBeDateTime(value: unknown): DateTime | null {
  if (!is.nonEmptyStringAndNotWhitespace(value)) return null
  return mustBeDateTime(value)
}

export function mustBeDuration(value: unknown): Duration {
  if (is.nonEmptyStringAndNotWhitespace(value)) {
    const durationFromIsoTime = Duration.fromISOTime(value)
    if (durationFromIsoTime.isValid) return durationFromIsoTime
    const durationFromIso = Duration.fromISO(value)
    if (durationFromIso.isValid) return durationFromIso
  }
  throw new Error(`Invalid duration: ${value}`)
}

export function mayBeDuration(value: unknown): Duration | null {
  if (!is.nonEmptyStringAndNotWhitespace(value)) return null
  return mustBeDuration(value)
}

export function mustBeInterval(value: unknown): Interval {
  if (is.array(value) && value.length === 2) {
    // TODO: implement parsing ['YYYY-MM-DD', 'YYYY-MM-DD']
    const [start, end] = value.map(mayBeDateTime)
    if (start?.isValid && end?.isValid) {
      const intervalFromArray = Interval.fromDateTimes(start, end)
      if (intervalFromArray.isValid) return intervalFromArray
    }
  }
  if (is.nonEmptyStringAndNotWhitespace(value)) {
    // TODO: implement parsing 'YYYY-MM-DD'
    const intervalFromIso = Interval.fromISO(value)
    if (intervalFromIso.isValid) return intervalFromIso
  }
  throw new Error(`Invalid interval: ${value}`)
}

export function mayBeInterval(value: unknown): Interval | null {
  if (!(is.nonEmptyStringAndNotWhitespace(value) || (is.array(value) && value.length === 2)))
    return null
  return mustBeInterval(value)
}

export function mustBeStringEnum<T extends string>(value: unknown, enumType: StringEnumType<T>): T {
  if (is.nonEmptyStringAndNotWhitespace(value)) {
    const t = value as unknown as T
    if (Object.values(enumType).includes(t)) return t
  }
  throw new Error(`Invalid string enum: ${value}`)
}

export function mayBeStringEnum<T extends string>(
  value: unknown,
  enumType: StringEnumType<T>,
): T | null {
  if (!is.nonEmptyStringAndNotWhitespace(value)) return null
  return mustBeStringEnum(value, enumType)
}

export type DataColumnConverter<K1 extends string, K2 extends string, V1, V2> = {
  payloadKey: K1
  recordKey: K2
  payloadToRecord(row: Record<string, V1>): Record<string, V2>
  recordToPayload(record: Record<string, V2>): Record<string, V1>
}

export function genericColumnConverter<K1 extends string, K2 extends string, V>(
  payloadKey: K1,
  recordKey: K2,
): DataColumnConverter<K1, K2, V, V> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord: (row) => ({ [recordKey]: row[payloadKey]! }),
    recordToPayload: (record) => ({ [payloadKey]: record[recordKey]! }),
  }
}

export function idColumnConverter<K1 extends string, K2 extends string>(
  payloadKey: K1,
  recordKey: K2,
): DataColumnConverter<K1, K2, string, RecordId> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord: (row) => ({ [recordKey]: mustBeRecordId(row[payloadKey]) }),
    recordToPayload: (record) => ({ [payloadKey]: record[recordKey]! }),
  }
}

export function dateTimeColumnConverter<K1 extends string, K2 extends string>(
  payloadKey: K1,
  recordKey: K2,
): DataColumnConverter<K1, K2, string, DateTime> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord: (row) => ({ [recordKey]: mustBeDateTime(row[payloadKey]) }),
    recordToPayload: (record) => ({
      [payloadKey]: record[recordKey]!.toSQL({ includeOffsetSpace: false })!,
    }),
  }
}

export function nullableStringColumnConverter<K1 extends string, K2 extends string>(
  payloadKey: K1,
  recordKey: K2,
  nonEmptyStringChecker = is.nonEmptyStringAndNotWhitespace,
): DataColumnConverter<K1, K2, string, string | null> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord: (row) => ({
      [recordKey]: nonEmptyStringChecker(row[payloadKey]) ? row[payloadKey] : null,
    }),
    recordToPayload: (record) => ({ [payloadKey]: record[recordKey] ?? '' }),
  }
}

// FIXME: https://github.com/microsoft/TypeScript/issues/30611
export function singleSelectionFieldColumnConverter<
  K1 extends string,
  K2 extends string,
  V extends string,
>(payloadKey: K1, recordKey: K2, VEnum: StringEnumType<V>): DataColumnConverter<K1, K2, string, V> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord: (row) => ({ [recordKey]: mustBeStringEnum(row[payloadKey], VEnum) }),
    recordToPayload: (record) => ({ [payloadKey]: record[recordKey] ?? '' }),
  }
}

export function nullableSingleSelectionFieldColumnConverter<
  K1 extends string,
  K2 extends string,
  V extends string,
>(
  payloadKey: K1,
  recordKey: K2,
  VEnum: StringEnumType<V>,
): DataColumnConverter<K1, K2, string, V | null> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord: (row) => ({ [recordKey]: mayBeStringEnum(row[payloadKey], VEnum) }),
    recordToPayload: (record) => ({ [payloadKey]: record[recordKey] ?? '' }),
  }
}

export function multiSelectionFieldColumnConverter<
  K1 extends string,
  K2 extends string,
  V extends string,
>(
  payloadKey: K1,
  recordKey: K2,
  VEnum: StringEnumType<V>,
): DataColumnConverter<K1, K2, string[], V[]> {
  return {
    payloadKey,
    recordKey,
    payloadToRecord(row) {
      const values = row[payloadKey]
      if (is.array(values) && values.every((value) => mustBeStringEnum(value, VEnum)))
        return { [recordKey]: values as V[] }
      throw new Error(`Invalid multi selection field: ${values}`)
    },
    recordToPayload: (record) => ({ [payloadKey]: record[recordKey] ?? [] }),
  }
}

export const baseDataColumnConverters: DataColumnConverter<
  keyof BasePayload,
  keyof BaseRecord,
  unknown,
  unknown
>[] = [
  idColumnConverter('id', 'id'),
  dateTimeColumnConverter('created', 'createdAt'),
  dateTimeColumnConverter('updated', 'updatedAt'),
]
