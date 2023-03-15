/*
 * SPDX-FileCopyrightText: 2022 Blitz Revolution Inc.
 * SPDX-License-Identifier: MIT
 *
 * Source: https://github.com/blitz-js/blitz/blob/main/packages/blitz/src/logging.ts
 */
import c from 'chalk'
import ora from 'ora'
import readline from 'readline'

export const newLine = () => {
  console.log(' ')
}

export const chalk = c

export const withCaret = (str: string) => {
  return `${c.gray('>')} ${str}`
}

export const withCheck = (str: string) => {
  return `${c.green('✔')} ${str}`
}

export const withProgress = (str: string) => {
  return withCaret(str)
}

export const greenText = (str: string) => {
  return `${c.green(str)}`
}

/**
 * Clears the line and optionally log a message to stdout.
 *
 * @param {string} msg
 */
export const clearLine = (msg?: string) => {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  msg && process.stdout.write(msg)
}

export const clearConsole = () => {
  if (process.platform === 'win32') {
    process.stdout.write('\x1B[2J\x1B[0f')
  } else {
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H')
  }
}

/**
 * Logs a progress message to stdout.
 *
 * @param {string} msg
 */
export const progress = (msg: string) => {
  console.log(withProgress(msg))
}

export const spinner = (str?: string) => {
  return ora({
    text: str,
  })
}

/**
 * Logs a green success message to stdout.
 *
 * @param {string} msg
 */
export const success = (msg: string) => {
  console.log(withCheck(c.green(msg)))
}

/**
 * Logs a red error message to stdout.
 *
 * @param {string} msg
 */
export const error = (msg: string) => {
  console.log(`${c.red(msg)}`)
}

/**
 * Colorizes a variable for display.
 *
 * @param {string} val
 */
export const variable = (val: any) => {
  return c.cyan.bold(`${val}`)
}
