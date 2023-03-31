import { expect, test, describe, vi } from 'vitest'
import { getSchemaTableColumns } from '../../src/codegen/generator'
import { sqlTableColumns } from '../mockdata'

describe('Codegen - Generator', () => {
  test('getSchemaTableColumns', async () => {
    const fnResult = await getSchemaTableColumns('testSchema', 'testTable')
    expect(fnResult).toMatchSnapshot()
  })
})

//Mock the Presto Client
vi.mock('src/client/sql-client', () => {
  const SqlClient = vi.fn()
  SqlClient.prototype.query = vi.fn(async () => {
    return sqlTableColumns
  })
  SqlClient.prototype.end = vi.fn()

  return { SqlClient }
})
