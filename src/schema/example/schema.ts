/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  ExampleInterface,
  ExampleSubInterface,
} from 'src/schema/example/interface'

import {
  builder,
  IntFieldComparison,
  Paging,
  SortDirection,
  StringFieldComparison,
} from 'src/builder'

const FilterInput = builder.inputRef('ExampleFilterInput').implement({
  fields: (t) => ({
    name: t.field({ type: StringFieldComparison }),
    birthdate: t.field({ type: StringFieldComparison }),
    height: t.field({ type: IntFieldComparison }),
    and: t.field({ type: [FilterInput] }),
    or: t.field({ type: [FilterInput] }),
  }),
})

export const SortFields = builder.enumType('ExampleSortFields', {
  values: ['name', 'birthday', 'height'] as const,
})

const SortingInput = builder.inputType('Example2SortOrder', {
  fields: (t) => ({
    field: t.field({
      type: SortFields,
    }),
    direction: t.field({
      type: SortDirection,
    }),
  }),
})

export const Example = builder.objectRef<ExampleInterface>('Example')

export const ExampleSub = builder.objectRef<ExampleSubInterface>('ExampleSub')

Example.implement({
  fields: (t) => ({
    name: t.exposeString('name'),
    birthdate: t.exposeString('birthdate'),
    height: t.exposeFloat('height'),
    sub: t.expose('sub', { type: ExampleSub }),
    subMany: t.expose('subMany', { type: [ExampleSub] }),
  }),
})

ExampleSub.implement({
  fields: (t) => ({
    name1: t.exposeString('name1'),
    birthdate1: t.exposeString('birthdate1'),
    height1: t.exposeFloat('height1'),
  }),
})

builder.queryFields((t) => ({
  example2: t.field({
    type: [Example],
    args: {
      filter: t.arg({ type: FilterInput, required: false }),
      paging: t.arg({ type: Paging, required: false }),
      sorting: t.arg({ type: [SortingInput], required: false }),
    },
    resolve: () => {
      return [
        {
          name: 'test',
          birthdate: '2022-10-04',
          height: 7.5,
          sub: {
            name1: 'test1',
            birthdate1: '2022-10-04',
            height1: 7.5,
          },
          subMany: [
            {
              name1: 'test2',
              birthdate1: '2022-10-04',
              height1: 7.5,
            },
            {
              name1: 'test2',
              birthdate1: '2022-10-04',
              height1: 7.5,
            },
          ],
        },
      ]
    },
  }),
}))
