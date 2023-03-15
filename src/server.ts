/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { renderGraphiQL } from '@graphql-yoga/render-graphiql'
import { schema } from './schema'
import { AddressInfo } from 'node:net'

const yoga = createYoga({ schema, renderGraphiQL })
const server = createServer(yoga)

server.listen({ port: process.env.YOGA_PORT || 4000 }, () => {
  const { port } = server.address() as AddressInfo
  console.info(`Server is running on http://localhost:${port}/graphql`)
})
