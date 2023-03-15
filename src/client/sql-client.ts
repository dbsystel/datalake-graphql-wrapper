/*
 * @Source: https://github.com/tagomoris/presto-client-node/issues/43#issuecomment-828779519
 *
 * SPDX-FileCopyrightText: 2021 Yevhen Samoilenko
 * SPDX-License-Identifier: Apache-2.0
 */
import dotenv from 'dotenv'
// @ts-ignore
import * as presto from 'presto-client'
import { SqlClientQueryInput } from 'types/datalake-graphql-wrapper'
import { PassThrough } from 'stream'
dotenv.config()

export class SqlClient {
  private client: any

  constructor() {
    this.client = new presto.Client({
      engine: process.env.ENGINE_TYPE,
      host: process.env.ENGINE_HOST,
      ssl: {
        rejectUnauthorized: false,
      },
      port: process.env.ENGINE_PORT,
      catalog: process.env.ENGINE_CATALOG,
      source: process.env.ENGINE_SOURCE || 'nodejs-client',
      user: process.env.ENGINE_USERNAME,
      basic_auth: {
        user: process.env.ENGINE_USERNAME,
        password: process.env.ENGINE_PASSWORD,
      },
    })
  }

  async query(queryArgs: SqlClientQueryInput): Promise<any[]> {
    const result: any[] = []
    const stream = this.queryStream(queryArgs)

    for await (const chunk of stream) {
      result.push(chunk)
    }

    return result
  }

  queryStream(queryArgs: SqlClientQueryInput): PassThrough {
    const stream = new PassThrough({ objectMode: true })
    const onData = (
      error: any,
      data: any[][],
      columns: { name: string }[],
    ): void => {
      if (error) {
        return
      }

      for (const row of data) {
        stream.write(
          Object.fromEntries(columns.map((c, i) => [c.name, row[i]])),
        )
      }
    }
    const onDone = (error: any): void => {
      if (error) {
        console.error(error)
        stream.destroy(error)
      }

      stream.end()
    }

    this.client.execute({
      ...queryArgs,
      data: onData,
      callback: onDone,
    })

    return stream
  }
}
