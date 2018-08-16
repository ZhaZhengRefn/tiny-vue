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
  return function (...args) {
    const result = fn.apply(this, args)
    if (!result) {
      return afterFn.apply(this, args)
    }
    return result
  }
}

export const chain = function (...args) {
  let fns = []
  if (Array.isArray(args[0]) && args.length === 1) {
    fns = args[0]
  } else {
    fns = args
  }
  return fns.reduce((pre, next) => {
    return after(pre, next)
  })
}

export const isPlainObject = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export const extend = function (to, from) {
  for (const key in from) {
    to[key] = from[key]
  }
  return to
}

// Firefox的原型链中具有watch方法，需要将其排除掉
export const nativeWatch = ({}).watch