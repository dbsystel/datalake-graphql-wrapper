/*
 * SPDX-FileCopyrightText: 2023 DB Systel GmbH
 * SPDX-License-Identifier: Apache-2.0
 */
<% for (const [modelName, definition] of Object.entries(models)) {%>
export interface <%= definition.interfaceName %> {
<% for (const definitionField of Object.values(definition.fields)) { %>  <%= definitionField.name.replaceAll('-','_') %>?: <%= definitionField.interfaceName || definitionField.fieldType %>
<% } %>
}
<% } %>
