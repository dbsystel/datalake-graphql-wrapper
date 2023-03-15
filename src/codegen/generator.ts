/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import dotenv from 'dotenv'
import { camelCase, upperFirst } from 'lodash-es'
import * as path from 'path'
import * as fs from 'fs'
import * as ejs from 'ejs'
import { SqlClient } from 'src/client/sql-client'
import replaceSpecialCharacters from 'replace-special-characters'
import {
  parseFields,
  generateJsonSchema,
  generateModel,
} from 'src/helpers/convert'
import { globby } from 'globby'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config()

type SchemaTableColumn = { name: string; type: string; description: string }

export const prepare = async (schema: string, tableName: string) => {
  const importPath = `src/schema/automated/${process.env.ENGINE_CATALOG}/${schema}/${tableName}`

  const targetPath = path.join(
    path.dirname(__dirname),
    '/schema/automated',
    `${process.env.ENGINE_CATALOG}/`,
    `${schema}/`,
    `${tableName}/`,
  )

  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true })
  }

  fs.mkdirSync(targetPath, { recursive: true })

  const baseClassName = `${upperFirst(
    camelCase(process.env.ENGINE_CATALOG),
  )}_${upperFirst(camelCase(schema))}_${upperFirst(camelCase(tableName))}`

  const queryName =
    `${process.env.ENGINE_CATALOG}_${schema}_${tableName}`.toLowerCase()

  const tableColumns = await getSchemaTableColumns(schema, tableName)
  const parsedFields = parseFields(tableColumns)
  const jsonSchema = generateJsonSchema({ source: parsedFields })
  const models = generateModel({
    source: jsonSchema,
    name: baseClassName,
    models: {},
    isRoot: true,
  })

  //@ts-ignore
  const mainModel = Object.values(models).find((ele) => ele.root == true)
  //@ts-ignore
  const filterFields = Object.values(mainModel.fields).filter(
    //@ts-ignore
    (ele) => ele.filter == true,
  )

  //@ts-ignore
  const dateFields = Object.entries(jsonSchema.properties)
    //@ts-ignore
    .filter((ele) => ele[1].type == 'date-time')
    .map((ele) => ele[0])

  return {
    schema,
    tableName,
    importPath,
    targetPath,
    baseClassName,
    queryName,
    tableColumns,
    parsedFields,
    jsonSchema,
    jsonSchemaAsString: JSON.stringify(jsonSchema, null, 2),
    models,
    filterFields,
    dateFields,
  }
}

const getSchemaTableColumns = async (
  schema: string,
  tableName: string,
): Promise<SchemaTableColumn[]> => {
  const client = new SqlClient()

  const rawTableColumns = await client.query({
    query: `SHOW COLUMNS from "${process.env.ENGINE_CATALOG}"."${schema}"."${tableName}"`,
    schema,
  })

  /**
   * since there could be special characters in the column name
   * we have to replace them
   *
   * INFO: This is not a problem on our side, it's a problem from the source
   * and they should update their schema to have valid column names
   */
  const tableColumns: SchemaTableColumn[] = rawTableColumns.map((ele) => {
    return {
      name: replaceSpecialCharacters(ele.Column),
      type: ele.Type,
      description: '',
    }
  })

  return tableColumns
}

export const generateIndexFile = async () => {
  const foundSchema = await globby('src/schema', {
    expandDirectories: {
      files: ['schema'],
      extensions: ['ts'],
    },
  })

  const indexFilePath = path.join(path.dirname(__dirname), '/schema/')
  if (fs.existsSync(`${path.join(indexFilePath, '/index.ts')}`)) {
    fs.rmSync(`${path.join(indexFilePath, '/index.ts')}`)
  }

  generateFromTemplate('index', { foundSchema }, indexFilePath, 'index.ts')
}

export const generateFromTemplate = (
  template: string,
  templateOptions: { [key: string]: any },
  targetPath: string,
  targetFilename: string,
) => {
  const templateFile = path.join(
    path.dirname(__dirname),
    `/codegen/templates/${template}.ejs.t`,
  )

  if (!fs.existsSync(templateFile)) {
    throw 'Template file does not exist: ' + templateFile
  }

  fs.readFile(templateFile, 'utf8', function (err, data) {
    if (err) throw err

    let generatedContent = ''

    generatedContent = ejs.render(data, templateOptions, {
      compileDebug: true,
    })

    fs.writeFileSync(path.join(targetPath, targetFilename), generatedContent)
  })
}
