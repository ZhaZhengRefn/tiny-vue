import {
  hasOwn,
} from 'shared/util'
import {
  warn
} from './debug'
import {
  isBuildInTag,
  isReservedTag,
} from './name'

const checkComponentNames = function (options) {
  for (const component in options.components) {
    validateComponentName(component)
  }
}

const validateComponentName = function (name) {
  // 检查是否已字母开头且仅包含字母或-的字符
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'can only contain alphanumeric characters and the hyphen, ' +
      'and must start with a letter.'      
    )
  }
  // 检查是否为内建组件名或html标签
  if (isBuildInTag(name) || isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name      
    )
  }
}

const strats = Object.create(null)

const defaultStrat = function (parentVal, childVal) {
  return childVal == null ? parentVal : childVal
}

export const mergeOptions = function (parent, child, vm) {
  // 校验子组件的组件名
  if (process.env.NODE_ENV !== 'production') {
    checkComponentNames(child)
  }
  // 开始合并选项
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}