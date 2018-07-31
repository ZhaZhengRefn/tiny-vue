export const warn = function (msg) {
  const hasConsole = typeof console !== 'undefined'
  if (hasConsole) {
    console.error(`[Warning]: ${msg}`)
  }
}