/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { queryConverter } from 'src/helpers/query-converter'
import { GenerateSqlQueryInput, Where } from 'types/datalake-graphql-wrapper'
import { DataSource } from 'typeorm'

/**
 * Generates the SQL query based on the user input
 *
 * @returns string
 */
export const generateSqlQuery = ({
  select,
  filter,
  transformFields,
  dateFields,
  paging,
  sorting,
  schema,
  tableName,
}: GenerateSqlQueryInput) => {
  const dataSource = new DataSource({ type: 'sqljs' })

  const selectBuilder = dataSource
    .createQueryBuilder()
    .addFrom(`${process.env.ENGINE_CATALOG}.${schema}.${tableName}`, tableName)

  select.forEach((fieldName: string) => {
    if (dateFields.includes(fieldName)) {
      selectBuilder.addSelect(
        `to_unixtime("${transformFields[fieldName] || fieldName}") as "${
          transformFields[fieldName] || fieldName
        }"`,
      )
    } else {
      selectBuilder.addSelect(`"${transformFields[fieldName] || fieldName}"`)
    }
  })

  const sqlQuery = queryConverter(
    selectBuilder,
    filter as Where,
    transformFields,
  )

  const orderQuery =
    sorting && sorting.length > 0
      ? `ORDER BY ${sorting
          .map((ele) => `${ele.field} ${ele.direction}`)
          .join(', ')}`
      : ''

  // https://trino.io/blog/2020/02/03/beyond-limit-presto-meets-offset-and-ties.html
  let pagingSql = ''
  if (!paging?.skip || paging.skip <= 0) {
    pagingSql = `FETCH FIRST ${paging?.perPage || 100} ROWS ONLY`
  } else {
    pagingSql = `OFFSET ${paging?.skip || 0} FETCH NEXT ${
      paging?.perPage || 100
    } ROWS ONLY`
  }

  return `${sqlQuery.getSql()} ${orderQuery} ${pagingSql}`
}
