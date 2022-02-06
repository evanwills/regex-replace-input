/// <reference types="vite/client" />

export type TResult = {
  sample: string,
  matches: Array<string>,
  output: string
}

export type TRegexPair = {
  find: RegExp,
  replace: string
}
