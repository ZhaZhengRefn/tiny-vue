export const hasOwn = (obj, key) => {
  if (typeof obj !== 'object') return false
  return Object.prototype.hasOwnProperty.call(obj, key)
}