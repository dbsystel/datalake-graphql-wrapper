/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
namespace NodeJS {
  interface ProcessEnv {
    ENGINE_TYPE: string
    ENGINE_HOST: string
    ENGINE_PORT: number
    ENGINE_CATALOG: string
    ENGINE_USERNAME: string
    ENGINE_PASSWORD: string
    ENGINE_SOURCE?: string
    YOGA_PORT?: number
  }
}
