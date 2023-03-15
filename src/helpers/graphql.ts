/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { FieldNode, GraphQLResolveInfo } from 'graphql'

/**
 * Gets the selected fields from the user query
 *
 * @param graphqlInfo GraphQLResolveInfo
 * @returns string[]
 */
export const getSelectFields = (graphqlInfo: GraphQLResolveInfo) => {
  return graphqlInfo.fieldNodes.flatMap((fieldNode) => {
    return fieldNode.selectionSet?.selections.flatMap((selection) => {
      return (selection as FieldNode).name.value
    })
  }) as string[]
}
