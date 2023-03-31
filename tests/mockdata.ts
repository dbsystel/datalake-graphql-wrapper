export const sqlTableColumns = [
  {
    Column: 'stringarray',
    Type: 'array(varchar)',
  },
  {
    Column: 'stringfield',
    Type: 'varchar',
  },
  {
    Column: 'booleanfield',
    Type: 'boolean',
  },
  {
    Column: 'datetimefield',
    Type: 'timestamp(3)',
  },
  {
    Column: 'bigintfield',
    Type: 'bigint',
  },
  {
    Column: 'simpleobject',
    Type: 'row(sosub1 varchar, sosub2 bigint)',
  },
  {
    Column: 'complexobject',
    Type: 'row(cosub1 varchar, cosub2 array(varchar), cosub3 array(row(cosub31 varchar, cosub32 varchar)))',
  },
  {
    Column: 'dash-field',
    Type: 'varchar',
  },
  {
    Column: 'special-äöü',
    Type: 'varchar',
  },
]

// copied/imported from /tests/codegen/__snapshots__/generator.test.ts.snap
export const generatedTableColumns = [
  {
    description: '',
    name: 'stringarray',
    type: 'array(varchar)',
  },
  {
    description: '',
    name: 'stringfield',
    type: 'varchar',
  },
  {
    description: '',
    name: 'booleanfield',
    type: 'boolean',
  },
  {
    description: '',
    name: 'datetimefield',
    type: 'timestamp(3)',
  },
  {
    description: '',
    name: 'bigintfield',
    type: 'bigint',
  },
  {
    description: '',
    name: 'simpleobject',
    type: 'row(sosub1 varchar, sosub2 bigint)',
  },
  {
    description: '',
    name: 'complexobject',
    type: 'row(cosub1 varchar, cosub2 array(varchar), cosub3 array(row(cosub31 varchar, cosub32 varchar)))',
  },
  {
    description: '',
    name: 'dash-field',
    type: 'varchar',
  },
  {
    description: '',
    name: 'special-aou',
    type: 'varchar',
  },
]

export const parsedFields = {
  bigintfield: 'bigint',
  booleanfield: 'boolean',
  complexobject: {
    cosub1: 'varchar',
    cosub2: ['varchar'],
    cosub3: [
      {
        cosub31: 'varchar',
        cosub32: 'varchar',
      },
    ],
  },
  'dash-field': 'varchar',
  datetimefield: 'timestamp(3)',
  simpleobject: {
    sosub1: 'varchar',
    sosub2: 'bigint',
  },
  'special-aou': 'varchar',
  stringarray: ['varchar'],
  stringfield: 'varchar',
}

export const generatedJsonSchema = {
  additionalProperties: false,
  properties: {
    bigintfield: {
      type: 'integer',
    },
    booleanfield: {
      type: 'boolean',
    },
    complexobject: {
      additionalProperties: false,
      properties: {
        cosub1: {
          type: 'string',
        },
        cosub2: {
          items: {
            type: 'string',
          },
          type: 'array',
        },
        cosub3: {
          items: {
            additionalProperties: false,
            properties: {
              cosub31: {
                type: 'string',
              },
              cosub32: {
                type: 'string',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
      },
      type: 'object',
    },
    'dash-field': {
      type: 'string',
    },
    datetimefield: {
      type: 'date-time',
    },
    simpleobject: {
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
    'special-aou': {
      type: 'string',
    },
    stringarray: {
      items: {
        type: 'string',
      },
      type: 'array',
    },
    stringfield: {
      type: 'string',
    },
  },
  type: 'object',
}
