import {
  hasOwn,
  getDataOrFn,
  chain,
  isPlainObject,
  extend,
  nativeWatch,
} from 'shared/util'
import {
  LIFECYCLE_HOOKS,
  ASSET_TYPES,
} from 'shared/constant'
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

// ? 1.el propsData合并策略
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}

// ? 2.data合并策略
strats.data = function (parentVal, childVal, vm) {
  //子组件策略
  if (!vm && (childVal && typeof childVal !== 'function')) {
    process.env.NODE_ENV !== 'production' && warn(
      'The "data" option should be a function ' +
      'that returns a per-instance value in component ' +
      'definitions.',
      vm
    )
    return parentVal
  }
  // 实例策略
  return mergeDataOrFn(parentVal, childVal, vm)
}

function mergeDataOrFn(parentVal, childVal, vm) {
  // 之所以data合并最终会处理成一个函数，是因为这样可以保证data在props之后使用
  // 显然在之前的代码可以看出，props是在data之前定义的，因为data可以调用props赋值
  if (!vm) {
    function mergeDataFn() {
      return mergeData(
        getDataOrFn(childVal, this),
        getDataOrFn(parentVal, this),
      )
    }
    return childVal && parentVal ? mergeDataFn : (childVal || parentVal)
  } else {
    return function mergeInstanceDataFn() {
      const instanceData = getDataOrFn(childVal, vm)
      const defaultData = getDataOrFn(parentVal, vm)
      return instanceData ? mergeData(instanceData, defaultData) : defaultData
    }
  }
}

function mergeData(to, from) {
  if (!from) return to
  let key, toVal, fromVal
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)){
      set(to, key, fromVal)//TODO: set to value with reactive
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)){
      mergeData(toVal, fromVal)
    }
  }
}

// ? 3.hook合并
const hasChild = function (parent, child) {
  if (!child) {
    return parent
  }
  return false
}
const hasParent = function (parent, child) {
  if (parent) {
    return parent.concat(child)
  }
  return false
}
const isChildArray = function (parent, child) {
  if (Array.isArray(child)) {
    return child
  }
  return [child]
}
const mergeHookChain = chain(
  hasChild,
  hasParent,
  isChildArray,
)
export const mergeHook = function (parentVal, childVal) {
  return mergeHookChain(parentVal, childVal)
}
// TODO:需要实现extend自测parentVal是否一定为array
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

// ? 4.merge assets
//以parentVal为原型，extend childVal。因此虽然子组件没有声明内置组件，但是在子组件的模板中仍然可以使用。例如keep-alive，transition
const mergeAssets = function(parentVal, childVal) {
  const res = Object.create(parentVal || null)
  if (childVal) {
    return extend(res, childVal)
  }
  return res
}
ASSET_TYPES.forEach(asset => {
  strats[asset + 's'] = mergeAssets
})

// ? 5.merge watch
// 子类的watch与实例的watch合并后均被执行
const mergeWatch = function(parentVal, childVal, vm, key) {
  // 去除firefox中Object.prototype.watch的影响
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined

  // 不存在子值时返回以父值为原型的对象
  if (!childVal) return Object.create(parentVal || null)
  // 不存在父值时返回子值
  if (!parentVal) return childVal
  // 父子值均存在时合并
  const ret = {}
  // 将父值包括原型链上的key复制至ret实例上
  extend(ret, parentVal)
  for(const key in childVal) {
    let parent = ret[key]
    // 存在parent时转换为数组包裹形式
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(parent)
        ? child
        : [child]
  }
  return ret
}
strats.watch = mergeWatch

// ? 6. 合并props、methods、inject、computed
strats.props = 
strats.methods = 
strats.inject = 
strats.computed = function(parentVal, childVal) {
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) {
    extend(ret, childVal)
  }
  return ret
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

  // ! 如果策略函数中拿不到 vm 参数，那么处理的就是子组件的选项
  function mergeField(key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}