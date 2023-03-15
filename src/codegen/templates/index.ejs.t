/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
<% for (const importFile of foundSchema) { %>import '<%= importFile %>'
<% } %>

import { builder } from 'src/builder'
export const schema = builder.toSchema()
