/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { parser } from 'json-column-parser'
import * as toSchema from 'to-json-schema'
import { omit, capitalize } from 'lodash-es'
import { JSONType } from 'json-column-parser/lib/common/types/type.common'

export const parseFields = (
  elements: { name: string; type: string; description: string }[],
) => {
  const fields: { [key: string]: JSONType } = {}
  const parsed = elements.map((element) => {
    let custom_source = element.type.replace(new RegExp(', ', 'g'), ',')
    custom_source = custom_source.replace(new RegExp(' ', 'g'), ':')

    return {
      name: element.name,
      type: parser.parseColumnType(custom_source),
    }
  })

  parsed.forEach((ele) => {
    fields[ele.name] = ele.type
  })

  return fields
}

export const generateJsonSchema = ({ source }: { source: any }) => {
  const toSchemaOptions = {
    objects: { additionalProperties: false, parentAsTitle: true },

    strings: {
      preProcessFnc: (value: string, defaultFnc: any) => {
        const schema = defaultFnc(value)
        if (value.includes('bigint') || value.includes('integer')) {
          schema.type = 'integer'
        }
        if (value.includes('boolean')) {
          schema.type = 'boolean'
        }
        if (value.includes('timestamp')) {
          schema.type = 'date-time'
        }
        return schema
      },
    },
  }

  return toSchema.default(source, toSchemaOptions)
}

export const generateModel = ({
  source,
  name,
  parent,
  models = {},
  isRoot = true,
}: {
  source: any
  name: any
  parent?: string
  models: any
  isRoot: any
}) => {
  const currentElement = omit(source, ['additionalProperties'])

  const currentModel: {
    [key: string]: any
  } = {}
  for (const [fieldName, fieldDefinition] of Object.entries(
    currentElement.properties,
  )) {
    const field = convertField({
      fieldName,
      fieldDefinition,
      parent: parent || name,
    })
    currentModel[fieldName] = {
      name: fieldName,
      fieldType: field.fieldType,
      graphqlType: field.graphqlType,
      graphqlTplType: field.graphqlTplType,
      isArray: field.isArray || false,
      interfaceName: field.interfaceName,
      nullable: true,
      filter: field.filter,
    }

    if (field.subModel) {
      models = generateModel({
        source: field.subModel,
        name: fieldName,
        parent: parent || name,
        models,
        isRoot: false,
      })
    }
  }

  models[!isRoot ? `${parent}_${capitalize(name)}` : name] = {
    root: isRoot,
    modelName: !isRoot ? `${parent}_${capitalize(name)}` : name,
    interfaceName: `${
      !isRoot ? `${parent}_${capitalize(name)}` : name
    }Interface`,
    fields: currentModel,
  }

  return models
}

const convertField = ({
  fieldName,
  fieldDefinition,
  parent,
}: {
  fieldName: string
  fieldDefinition: any
  parent?: string
}): {
  graphqlType: string
  graphqlTplType: string
  fieldType: string
  isArray?: boolean
  interfaceName?: string
  subModel: any
  filter: boolean
} => {
  const capitalizedName = capitalize(fieldName)
  switch (fieldDefinition.type) {
    case 'string':
      return {
        graphqlType: 'String',
        graphqlTplType: `'String'`,
        fieldType: 'string',
        subModel: false,
        filter: true,
      }

    case 'bigint':
      return {
        graphqlType: 'Float',
        graphqlTplType: `'Float'`,
        fieldType: 'number',
        subModel: false,
        filter: true,
      }

    case 'integer':
      return {
        graphqlType: 'Int',
        graphqlTplType: `'Int'`,
        fieldType: 'number',
        subModel: false,
        filter: true,
      }

    case 'boolean':
      return {
        graphqlType: 'Boolean',
        graphqlTplType: `'Boolean'`,
        fieldType: 'boolean',
        subModel: false,
        filter: true,
      }

    case 'date-time':
      return {
        graphqlType: 'DateTime',
        graphqlTplType: `'DateTime'`,
        fieldType: 'Date',
        subModel: false,
        filter: true,
      }

    case 'array':
      if (fieldDefinition.items.type != 'object') {
        const subType = convertField({
          fieldName,
          fieldDefinition: fieldDefinition.items,
        })

        return {
          graphqlType: `[${subType.graphqlType}]`,
          graphqlTplType: `['${subType.graphqlType}']`,
          isArray: true,
          fieldType: `${subType.fieldType}[]`,
          subModel: false,
          filter: false,
        }
      } else {
        return {
          graphqlType: `[${parent}_${capitalizedName}]`,
          graphqlTplType: `[${parent}_${capitalizedName}]`,
          isArray: true,
          fieldType: `${parent}_${capitalizedName}[]`,
          interfaceName: `${parent}_${capitalizedName}Interface[]`,
          subModel: fieldDefinition.items,
          filter: false,
        }
      }

    case 'object':
      return {
        graphqlType: `${parent}_${capitalizedName}`,
        graphqlTplType: `${parent}_${capitalizedName}`,
        fieldType: `${parent}_${capitalizedName}`,
        interfaceName: `${parent}_${capitalizedName}Interface`,
        subModel: fieldDefinition,
        filter: false,
      }

    default:
      return {
        graphqlType: 'Null',
        graphqlTplType: 'Null',
        fieldType: 'null',
        subModel: false,
        filter: false,
      }
  }
}
