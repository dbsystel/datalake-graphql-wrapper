/*
 * @Source: https://stackoverflow.com/a/63902324/2769836
 *
 * SPDX-FileCopyrightText: 2020 Manuel Nucci
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  Brackets,
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm'
import { format } from 'date-fns'
import {
  type Where,
  WhereOperator,
  type Field,
} from 'types/datalake-graphql-wrapper'

const handleArgs = (
  query: WhereExpressionBuilder,
  where: Where,
  transformFields: { [key: string]: string },
  andOr: 'andWhere' | 'orWhere',
) => {
  const whereArgs = Object.entries(where)

  whereArgs.map((whereArg) => {
    const [fieldName, filters] = whereArg
    const ops = Object.entries(filters)

    ops.map((parameters) => {
      const [operation, value] = parameters
      let fieldValue: any

      const isDate = value instanceof Date
      const valueType = typeof value

      if (isDate) {
        fieldValue = `timestamp '${format(value, 'yyyy-MM-dd HH:mm:ss')}'`
      } else if (valueType == 'string') {
        fieldValue = `'${value}'`
      } else {
        fieldValue = value
      }

      const transformedFieldName = transformFields[fieldName] || fieldName

      switch (operation) {
        case 'eq': {
          query[andOr](`${transformedFieldName} = ${fieldValue}`)

          break
        }
        case 'neq': {
          query[andOr](`${transformedFieldName} != ${fieldValue}`)

          break
        }
        case 'in': {
          query[andOr](`${transformedFieldName} IN (${value})`)
          break
        }
        case 'notIn': {
          query[andOr](`${transformedFieldName} NOT IN (${value})`)
          break
        }
        case 'lt': {
          query[andOr](`${transformedFieldName} < ${fieldValue}`)

          break
        }
        case 'lte': {
          query[andOr](`${transformedFieldName} <= ${fieldValue}`)

          break
        }
        case 'gt': {
          query[andOr](`${transformedFieldName} > ${fieldValue}`)

          break
        }
        case 'gte': {
          query[andOr](`${transformedFieldName} >= ${fieldValue}`)

          break
        }
        case 'like': {
          query[andOr](`${transformedFieldName} LIKE '%${value}%'`)
          break
        }
        case 'notLike': {
          query[andOr](`${transformedFieldName} NOT LIKE '%${value}%'`)
          break
        }

        default: {
          break
        }
      }
    })
  })

  return query
}

// functions
export const queryConverter = <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  where: Where,
  transformFields: { [key: string]: string },
) => {
  if (!where) {
    return query
  } else {
    return traverseTree(query, where, transformFields) as SelectQueryBuilder<T>
  }
}

const traverseTree = (
  query: WhereExpressionBuilder,
  where: Where,
  transformFields: { [key: string]: string },
  upperOperator = WhereOperator.AND,
) => {
  Object.keys(where).forEach((key) => {
    if (key === WhereOperator.OR) {
      query.orWhere(buildNewBrackets(where, WhereOperator.OR, transformFields))
    } else if (key === WhereOperator.AND) {
      query.andWhere(
        buildNewBrackets(where, WhereOperator.AND, transformFields),
      )
    } else {
      // Field
      query = handleArgs(
        query,
        where as Field,
        transformFields,
        upperOperator === WhereOperator.AND ? 'andWhere' : 'orWhere',
      )
    }
  })

  return query
}

const buildNewBrackets = (
  where: Where,
  operator: WhereOperator,
  transformFields: { [key: string]: string },
) => {
  return new Brackets((qb: any) =>
    (where[operator] || []).map((queryArray) => {
      return traverseTree(qb, queryArray, transformFields, operator)
    }),
  )
}
