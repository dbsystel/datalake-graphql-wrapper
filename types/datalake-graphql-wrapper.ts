/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { InputShapeFromFields, InputFieldRef } from '@pothos/core'

export type SqlClientQueryInput = { query: string; schema?: string }

export type GenerateSqlQueryInput = {
  select: string[]
  filter?: Where | null
  transformFields: { [key: string]: string }
  dateFields: string[]
  paging?: InputShapeFromFields<{
    perPage: InputFieldRef<number | null | undefined, 'InputObject'>
    skip: InputFieldRef<number | null | undefined, 'InputObject'>
  }> | null
  sorting?: { field: string; direction: string }[]
  schema: string
  tableName: string
}

export enum WhereOperator {
  AND = 'and',
  OR = 'or',
}

// interfaces
export type FieldOptions = {
  eq?: string
  neq?: string
  in?: string
  notIn?: string
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  like?: string
  notLike?: string
}

export type Field = {
  [key: string]: FieldOptions
}

export type Where = {
  [K in WhereOperator]?: (Where | Field)[]
}

export type TransformInput = {
  data: any
  definition: any
  transformFields?: { [key: string]: string }
  dateFields: string[]
}
