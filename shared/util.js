export const hasOwn = (obj, key) => {
  if (typeof obj !== 'object') return false
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const getDataOrFn = (val, context) => {
  typeof val === 'function' ?
    val.call(context, context) :
    val
}