/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  <% for (const definition of Object.values(models)) {%>
  <%= definition.interfaceName %>,
  <% } %>
} from '<%= importPath %>/interface'

import jsonSchema from '<%= importPath %>/json-schema'

import { 
  builder, 
  Paging, 
  SortDirection, 
  
  StringFieldComparison,
  IntFieldComparison,
  FloatFieldComparison,
  BooleanFieldComparison,
  DateFieldComparison,
  DateTimeFieldComparison,
  IDFieldComparison
} from 'src/builder'
import { getSelectFields } from 'src/helpers/graphql'
import { generateSqlQuery } from 'src/helpers/query-builder'
import { SqlClient } from 'src/client/sql-client'
import { transform, swap } from 'src/helpers/transform'

const FilterInput = builder
  .inputRef('<%= baseClassName %>FilterInput')
  .implement({
      fields: (t) => ({
        <% for(const filterField of filterFields) {%>
        
        <%= filterField.name.replaceAll('-','_') %>: t.field({
        type: <%= filterField.graphqlType %>FieldComparison
      }),
        <% } %>

      and: t.field({
        type: [ FilterInput ],
      }),
      or: t.field({
        type: [ FilterInput ],
      }),
      }),
    })

export const SortFields = builder.enumType('<%= baseClassName %>SortFields', {
  values: [<% for(const filterField of filterFields) {%>'<%= filterField.name.replaceAll('-','_') %>', <% } %>] as const,
})

const SortingInput = builder
  .inputRef('<%= baseClassName %>SortOrder')
  .implement({
    fields: (t) => ({
      field: t.field({
        type: SortFields,
      }),
      direction: t.field({
        type: SortDirection,
      }),
    }),
  })

<% for (const [name, definition] of Object.entries(models)) {%>
export const <%= name %> = builder.objectRef<<%= definition.interfaceName %>>('<%= name %>')
<% } %>

<% for (const [name, definition] of Object.entries(models)) {%>
<%= name %>.implement({
  fields: (t) => ({
  <% for (const definitionField of Object.values(definition.fields)) { %>  <%= definitionField.name.replaceAll('-','_') %>: t.expose('<%= definitionField.name.replaceAll('-','_') %>', { type: <%- definitionField.graphqlTplType %>, nullable: true }),
  <% } %>  
  }),
})
<% } %>


const transformFields = {
  <% for (const [name, definition] of Object.entries(models)) { %>
  <% for (const definitionField of Object.values(definition.fields)) { %><% if(definitionField.name.includes('-')) {%>'<%= definitionField.name.replaceAll('-','_') %>': '<%= definitionField.name %>',<% } %>
  <% } %><% } %>
}

const dateFields = [<% for(const fieldName of dateFields) { %><% if(fieldName.includes('-')) {%>'<%= fieldName.replaceAll('-','_') %>', <% } else { %>'<%= fieldName %>',<% } %><% } %>]

builder.queryFields((t) => ({
  <%= queryName %> : t.field({
    type: [ <%= baseClassName %> ],
    args: {
      filter: t.arg({ type: FilterInput }),
      paging: t.arg({ type: Paging }),
      sorting: t.arg({ type: [SortingInput] }),
    },
    resolve: async (parent, args, context, info) => {

      const selectFields = getSelectFields(info)
      const query = generateSqlQuery({
        select: selectFields, 
        schema: '<%= schema %>', 
        tableName: '<%= tableName %>',
        transformFields,
        dateFields,
        filter: args.filter,
        paging: args.paging,
        sorting: args.sorting as unknown as {
          field: string
          direction: string
        }[],
      })

      const client = new SqlClient()

      const records = await client.query({ query, schema: '<%= schema %>' })
      return records.map((record) =>
        transform({ 
          data: record, 
          definition: jsonSchema.properties, 
          transformFields: swap(transformFields),
          dateFields
        }),
      )
    },
  }),
}))
