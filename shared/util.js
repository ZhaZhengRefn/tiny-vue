export const hasOwn = function (obj, key) {
  if (typeof obj !== 'object') return false
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const getDataOrFn = function (val, context) {
  typeof val === 'function' ?
    val.call(context, context) :
    val
}

export const after = function (fn, afterFn) {
  return function(...args) {
    const result = fn.apply(this, args)
    if (!result) {
      return afterFn.apply(this, args)
    }
    return result
  }
}

export const chain = function (fns) {
  return fns.reduce((pre, next) => {
    return after(pre, next)
  })
}