/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
export interface ExampleInterface {
  name: string
  birthdate: string
  height: number
  sub: ExampleSubInterface
  subMany: ExampleSubInterface[]
}

export interface ExampleSubInterface {
  name1: string
  birthdate1: string
  height1: number
}
