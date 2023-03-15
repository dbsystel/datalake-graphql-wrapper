/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import { TransformInput } from 'types/datalake-graphql-wrapper'

const transformObject = ({
  data,
  definition,
  transformFields,
  dateFields,
}: TransformInput) => {
  const res: { [key: string]: any } = {}

  // get the field names from the definition
  const definitionFields = Object.keys(definition)

  for (let i = 0; i < data.length; i++) {
    // get the current property name
    const propName =
      transformFields && transformFields[definitionFields[i]]
        ? transformFields[definitionFields[i]]
        : definitionFields[i]
    // get the definition for the current field
    const fieldDefinition = definition[definitionFields[i]]

    // in case the current value is a simple type, return it
    if (fieldDefinition.type !== 'array' && fieldDefinition.type !== 'object') {
      res[propName] = data[i]
    }

    // if the expected value for the current property is an object,
    // run the object transformation
    if (fieldDefinition.type === 'object') {
      res[propName] = transformObject({
        data: data[i],
        definition: fieldDefinition.properties,
        transformFields,
        dateFields,
      })
    }

    // if the expected value for the current property is an array,
    // run the array transformation
    if (fieldDefinition.type === 'array') {
      res[propName] = transformArray({
        data: data[i],
        definition: fieldDefinition.items,
        transformFields,
        dateFields,
      })
    }
  }
  return res
}

const transformArray = ({
  data,
  definition,
  transformFields,
  dateFields,
}: TransformInput) => {
  // in case we have a simple type like string, number, etc.
  // use the given data as return value
  if (definition.type !== 'object') {
    return data
  }

  // otherwise run the transform object function
  // to generate the key/value pair
  // NOTE: Since I don't have array of arrays in my usecase
  // I didn't implemented the check for arrays
  // i assume that the return value should be always
  // an array of object or array of string/number/boolean
  return data.map((ele: any) => {
    return transformObject({
      data: ele,
      definition: definition.properties,
      transformFields,
      dateFields,
    })
  })
}

export const transform = ({
  data,
  definition,
  transformFields,
  dateFields,
}: TransformInput) => {
  const res: any = {}

  for (const [key, value] of Object.entries(data)) {
    const fieldName =
      transformFields && transformFields[key] ? transformFields[key] : key
    // get the current field definition from the schema
    const fieldDefinition = definition[key]

    // for simple types like string, number, etc. we don't have
    // to run a transformation, just return the given value
    if (fieldDefinition.type !== 'object' && fieldDefinition.type !== 'array') {
      if (dateFields.includes(key)) {
        res[fieldName] = value && (value as number) * 1000
      } else {
        res[fieldName] = value
      }
    }

    // in case of an object, run the object transformation
    if (fieldDefinition.type === 'object') {
      res[fieldName] = transformObject({
        data: value,
        definition: fieldDefinition.properties,
        transformFields,
        dateFields,
      })
    }

    // in case of an array, run the array transformation
    if (fieldDefinition.type === 'array') {
      res[fieldName] = transformArray({
        data: value,
        definition: fieldDefinition.items,
        transformFields,
        dateFields,
      })
    }
  }

  return res
}

export const swap = (obj: { [key: string]: string }) =>
  Object.fromEntries(Object.entries(obj).map((a) => a.reverse()))
