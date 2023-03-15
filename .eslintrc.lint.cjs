/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
module.exports = {
  extends: [
    './.eslintrc.cjs'
  ],
  plugins: [ 'unused-imports' ],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
    ]
  }
};
