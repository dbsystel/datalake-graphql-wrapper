/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { builder } from './builder'
import { InputFieldRef } from '@pothos/core'

type AllowedOperators =
  | 'is'
  | 'isNot'
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'notLike'
  | 'in'
  | 'notIn'

const generateComparison = ({
  name,
  type,
  allowedOperators,
}: {
  name?: string
  type: any
  allowedOperators: AllowedOperators[]
}) => {
  return builder.inputType(`${name || type}FieldComparison`, {
    fields: (t) => {
      const operators: { [key: string]: InputFieldRef<any, 'InputObject'> } = {
        is: t.boolean({}),
        isNot: t.boolean({}),
        eq: t.field({ type }),
        neq: t.field({ type }),
        gt: t.field({ type }),
        gte: t.field({ type }),
        lt: t.field({ type }),
        lte: t.field({ type }),
        like: t.field({ type }),
        notLike: t.field({ type }),
        in: t.field({ type: [type] }),
        notIn: t.field({ type: [type] }),
      }

      const operatorKeys = allowedOperators || Object.keys(operators)

      const availableOperators: {
        [key: string]: InputFieldRef<any, 'InputObject'>
      } = {}

      for (const operatorKey of operatorKeys) {
        availableOperators[operatorKey] = operators[operatorKey]
      }

      return availableOperators
    },
  })
}

export const createStringFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'String',
    allowedOperators: ['eq', 'neq', 'like', 'notLike', 'in', 'notIn'],
  })
}

export const createIntFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'Int',
    allowedOperators: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in', 'notIn'],
  })
}

export const createFloatFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'Float',
    allowedOperators: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in', 'notIn'],
  })
}

export const createIDFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'ID',
    allowedOperators: ['eq', 'neq', 'in', 'notIn'],
  })
}

export const createBooleanFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'Boolean',
    allowedOperators: ['is', 'isNot'],
  })
}

export const createDateFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'Date',
    allowedOperators: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
  })
}

export const createDateTimeFieldComparison = ({ name }: { name?: string }) => {
  return generateComparison({
    name,
    type: 'DateTime',
    allowedOperators: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
  })
}
