<!--
SPDX-FileCopyrightText: 2023 DB Systel GmbH

SPDX-License-Identifier: Apache-2.0
-->

<div align="center">
  <h1>
    DataLake GraphQL Wrapper
    <br />
    <span style="font-size:12px">Made with ❤️ by DB Systel GmbH</span>
  </h1>
</div>

The `DataLake GraphQL Wrapper` provides a GraphQL API for presto/trino.

[![REUSE status](https://api.reuse.software/badge/github.com/dbsystel/datalake-graphql-wrapper)](https://api.reuse.software/info/github.com/dbsystel/datalake-graphql-wrapper)


## Features

- Automatic endpoint generation via interactive cli
  - Generates the interfaces and available endpoint fields based on the fetched database schema
  - Generates the filter fields for all root fields
  - Sorting
  - Pagination
- Support for nested fields
- date/time transformation
- Written in TypeScript
- Easy to extend
- Using only Open Source Software
- It's free

## Installation

```bash
git clone git@github.com:dbsystel/datalake-graphql-wrapper.git
cd datalake-graphql-wrapper
npm i
cp .env.example .env
```

## Run the dev server

```bash
# Generate the index file to have all schemas available
npm run cli:index

# Start the dev server
npm run dev
```

## Configuration

To get started, you have to update the `.env` file.

| Variable        | Required | Description                                                                                                                                         |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| ENGINE_TYPE     | Yes      | Changes the header variable to switch between presto and trino. The value will be used in the sql client.<br />Valid values are: `trino` / `presto` |
| ENGINE_HOST     | Yes      | Presto/Trino coordinator hostname or address                                                                                                        |
| ENGINE_PORT     | Yes      | Presto/Trino coordinator port                                                                                                                       |
| ENGINE_CATALOG  | Yes      | Presto/Trino catalog name                                                                                                                           |
| ENGINE_USERNAME | Yes      | User which will be used to login                                                                                                                    |
| ENGINE_PASSWORD | Yes      | Password for the user                                                                                                                               |
| ENGINE_SOURCE   | No       | Source name which will be used for the query. Default is `nodejs-client`                                                                            |

## Command Line Interface

### Available commands

```
# Start the interactive endpoint generation
npm run cli

# Generate only the index.ts with all generated schemata
npm run cli:index
```

The following args are available for `npm run cli`

| Arg         | Description                                                                                                                                                                     | Example                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--schema`  | Sets the schema name and skips the cli prompt                                                                                                                                   | `npm run cli -- --schema<schemaname>`                                                       |
| --table     | Sets the table and skips the cli prompt.<br />You can define multiple tables.<br />Should be only used if you use `--schema`                                                    | `npm run cli -- --schema<schemaname> --table <table1_in_schema> --table <table2_in_schema>` |
| --lint      | Disable lint.<br />Helpful if you want to run the code generator multiple times.<br />( e.g. for different schemas )                                                            | `npm run cli -- --lint false`                                                               |
| --index     | Disable index file generation.<br />Helpful if you want to run the code generator multiple times.<br />( e.g. for different schemas )                                           | `npm run cli -- --index false`                                                              |
| --indexonly | Skips the questions for schema/table and generates only the<br /> `src/schema/index.ts` file based on the existing endpoints. <br />( helpful if you created your own endpoint) | `npm run cli -- --onlyindex true` / Alias: `npm run cli:index`                              |

### Generate Endpoints

To start the code generator you have to run the following command.

```bash
npm run cli
```

Or if you know the schema and tablename, you can also use this command:

```bash
npm run cli -- --schema <schemaname> --table <tablename>
```

### Generate only the `src/schema/index.ts`

```bash
npm run cli:index
```

### Start the server

To run the server in development mode:

```bash
npm run dev
```

Otherwise, use:

```bash
npm run start
```

## Compliance

We're using [REUSE](https://reuse.software/) to ensure everything is compliant.

To install it locally, please ensure that you have `python` installed.

Run the following command to install it:

```bash
pip install -r requirements.txt
```

To run the linter:

```bash
reuse lint
```

## Todos

- [ ] Add tests
- [ ] More documentation
- [ ] Add/Create some HowTos
  - [ ] Manual endpoint creation
  - [ ] Authorization

## Credits

- [https://pothos-graphql.dev](https://pothos-graphql.dev)
- [https://the-guild.dev/graphql/yoga-server](https://the-guild.dev/graphql/yoga-server)
- [https://github.com/tagomoris/presto-client-node](https://github.com/tagomoris/presto-client-node)

## License

This project is licensed under [Apache-2.0](LICENSES/Apache-2.0.txt)

## Contribute

See how to [contribute](CONTRIBUTING.md)

---

Trino is open source software licensed under the Apache License 2.0 and supported by the [Trino Software Foundation](https://trino.io/foundation.html).

Presto is a registered trademark of [LF Projects, LLC](https://lfprojects.org/policies/trademark-policy/).
