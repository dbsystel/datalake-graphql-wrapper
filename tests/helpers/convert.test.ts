import { expect, test, describe } from 'vitest'
import {
  parseFields,
  generateJsonSchema,
  generateModel,
  convertField,
} from '../../src/helpers/convert'
import {
  generatedJsonSchema,
  generatedTableColumns,
  parsedFields,
} from '../mockdata'

describe('Helpers - Convert', () => {
  test('parseFields', async () => {
    const fnResult = parseFields(generatedTableColumns)
    expect(fnResult).toMatchSnapshot()
  })

  test('generateJsonSchema', async () => {
    const fnResult = generateJsonSchema({ source: parsedFields })
    expect(fnResult).toMatchSnapshot()
  })

  test('generateModel', async () => {
    const fnResult = generateModel({
      source: generatedJsonSchema,
      name: 'mockModel',
      models: {},
      isRoot: true,
    })

    expect(fnResult).toMatchSnapshot()
    expect(Object.keys(fnResult).length).toBe(4)
    expect(Object.keys(fnResult).sort()).toEqual([
      'mockModel',
      'mockModel_Complexobject',
      'mockModel_Cosub3',
      'mockModel_Simpleobject',
    ])
  })
})

describe('Helpers - Convert - Field Converter', () => {
  test('stringField', () => {
    const fnResult = convertField({
      fieldName: 'stringfield',
      fieldDefinition: generatedJsonSchema.properties.stringfield,
    })
    expect(fnResult).toMatchObject({
      graphqlType: 'String',
      graphqlTplType: "'String'",
      fieldType: 'string',
      subModel: false,
      filter: true,
    })
  })
  test('numberField', () => {
    const fnResult = convertField({
      fieldName: 'numberfield',
      fieldDefinition: generatedJsonSchema.properties.bigintfield,
    })
    expect(fnResult).toMatchObject({
      graphqlType: 'Int',
      graphqlTplType: "'Int'",
      fieldType: 'number',
      subModel: false,
      filter: true,
    })
  })
  test('booleanField', () => {
    const fnResult = convertField({
      fieldName: 'booleanfield',
      fieldDefinition: generatedJsonSchema.properties.booleanfield,
    })
    expect(fnResult).toMatchObject({
      graphqlType: 'Boolean',
      graphqlTplType: "'Boolean'",
      fieldType: 'boolean',
      subModel: false,
      filter: true,
    })
  })
  test('datetimeField', () => {
    const fnResult = convertField({
      fieldName: 'datetimefield',
      fieldDefinition: generatedJsonSchema.properties.datetimefield,
    })
    expect(fnResult).toMatchObject({
      graphqlType: 'DateTime',
      graphqlTplType: "'DateTime'",
      fieldType: 'Date',
      subModel: false,
      filter: true,
    })
  })
  test('arrayStringField', () => {
    const fnResult = convertField({
      fieldName: 'arraystringfield',
      fieldDefinition: generatedJsonSchema.properties.stringarray,
    })
    expect(fnResult).toMatchObject({
      graphqlType: '[String]',
      graphqlTplType: "['String']",
      fieldType: 'string[]',
      subModel: false,
      isArray: true,
      filter: false,
    })
  })
  test('objectField', () => {
    const fnResult = convertField({
      fieldName: 'objectfield',
      fieldDefinition: generatedJsonSchema.properties.simpleobject,
      parent: 'mockModel',
    })
    expect(fnResult).toMatchObject({
      graphqlTplType: 'mockModel_Objectfield',
      graphqlType: 'mockModel_Objectfield',
      interfaceName: 'mockModel_ObjectfieldInterface',
      subModel: {
        additionalProperties: false,
        properties: {
          sosub1: {
            type: 'string',
          },
          sosub2: {
            type: 'integer',
          },
        },
        type: 'object',
      },
    })
  })
})
