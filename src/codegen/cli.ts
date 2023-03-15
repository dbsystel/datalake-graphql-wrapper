/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
import dotenv from 'dotenv'
import prompts, { Choice } from 'prompts'
import {
  generateFromTemplate,
  generateIndexFile,
  prepare,
} from 'src/codegen/generator'
import replaceSpecialCharacters from 'replace-special-characters'
import { SqlClient } from 'src/client/sql-client'
import { spinner, withCheck } from 'src/codegen/logger'
import c from 'chalk'
import { spawn } from 'cross-spawn'
import args from 'args'

dotenv.config()

args
  .option('schema', 'schema to use')
  .option('table', 'table to use')
  .option('index', 'Generate index file')
  .option('onlyindex', '(Re-)Generate the index file')
  .option('lint', 'Lint the generated code')

const flags = args.parse(process.argv)

;(async () => {
  const onState = (state: { value: any; aborted: boolean }) => {
    if (state.aborted) {
      process.nextTick(() => {
        process.exit(0)
      })
    }
  }

  if (
    flags.onlyindex &&
    (flags.onlyindex === 'true' || flags.onlyindex === true)
  ) {
    await generateIndexFile()
    console.log(withCheck(c.bold('Index file with all imports generated!')))
    await lintCode('src/schema/index.ts')
    console.log(withCheck(c.bold('Linted!')))
  } else {
    const client = new SqlClient()

    let schemaResponse
    let selectedTables

    if (!flags.schema || typeof flags.schema !== 'string') {
      const fetchRemoteSchemas = await client
        .query({
          query: `SHOW SCHEMAS from ${process.env.ENGINE_CATALOG}`,
        })
        .catch(() => {
          process.exit(1)
        })

      const schemas: Choice[] = fetchRemoteSchemas.map((ele) => {
        return { title: ele.Schema, value: ele.Schema }
      })

      schemaResponse = await prompts({
        type: 'autocomplete',
        name: 'schema',
        message: 'Choose a schema',
        choices: schemas,
        onState,
      })
    }

    const schemaResult =
      flags.schema && typeof flags.schema == 'string'
        ? flags.schema
        : schemaResponse?.schema

    if (!flags.table) {
      const fetchRemoteTables = await client
        .query({
          query: `SHOW TABLES from "${process.env.ENGINE_CATALOG}"."${schemaResult}"`,
        })
        .catch(() => {
          process.exit(1)
        })

      const tableNames: Choice[] = fetchRemoteTables.map((ele) => {
        return {
          title: ele.Table,
          value: replaceSpecialCharacters(ele.Table),
        }
      })

      tableNames.unshift({ title: '### All tables ###', value: 'all' })

      const tableResponse: { tables: string[] } = await prompts({
        type: 'autocompleteMultiselect',
        name: 'tables',
        message: 'Choose some tables',
        choices: tableNames,
        initial: 0,
        onState,
      })

      selectedTables = tableResponse.tables.includes('all')
        ? tableNames.map((ele) => ele.value).filter((ele) => ele != 'all')
        : tableResponse.tables
    } else {
      selectedTables =
        typeof flags.table == 'string' ? [flags.table] : flags.table
    }
    const progressSpinner = spinner().start()

    for (const tableName of selectedTables) {
      progressSpinner.text = `Generate code for table ${tableName}...`
      const preparedTable = await prepare(schemaResult, tableName)
      generateFromTemplate(
        'interface',
        preparedTable,
        preparedTable.targetPath,
        'interface.ts',
      )

      generateFromTemplate(
        'schema',
        preparedTable,
        preparedTable.targetPath,
        'schema.ts',
      )
      generateFromTemplate(
        'jsonSchema',
        preparedTable,
        preparedTable.targetPath,
        'json-schema.ts',
      )
    }
    progressSpinner.succeed(c.bold('All files generated!'))

    let indexResponse

    if (flags.index == null || flags.index == undefined) {
      indexResponse = await prompts({
        type: 'toggle',
        name: 'index',
        message: 'Generate index file?',
        initial: true,
        onState,
      })
    }

    const shouldIndex =
      flags.index == true || flags.index == 'true' || indexResponse?.index

    if (shouldIndex) {
      await generateIndexFile()
      console.log(withCheck(c.bold('Index file with all imports generated!')))
    }

    let lintResponse
    if (flags.lint == null || flags.lint == undefined) {
      lintResponse = await prompts({
        type: 'toggle',
        name: 'lint',
        message: 'Run linter?',
        initial: true,
        onState,
      })
    }

    const shouldLint =
      flags.lint == true || flags.lint == 'true' || lintResponse?.lint

    if (shouldLint) {
      await lintCode()
      console.log(withCheck(c.bold('Linted!')))
    }
    console.log(withCheck(c.bold(`Done! Let's gooooooo...`)))
  }
})()

async function lintCode(path = 'src/schema/**/*.*') {
  await new Promise((resolve) => {
    const cp = spawn(
      `eslint`,
      [path, '--fix', '--config', '.eslintrc.lint.cjs'],
      {
        stdio: ['inherit', 'pipe', 'pipe'],
      },
    )
    cp.on('exit', resolve)
  })
}
