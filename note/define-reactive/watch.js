import Dep from './dep'

let uid = 0

const parseExp = function (exp) {
  const keys = exp.split('.')
  return function (obj) {
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]]
    }
    return obj
  }
}

class Watcher {
  constructor(vm, exp, cb) {
    this.id = uid++
    this.cb = cb
    this.vm = vm
    // 防止多次求值重复收集依赖，记录上次求值中已被收集的依赖id
    this.deps = []
    // 防止单次求值重复收集依赖，记录当次求值中已被收集的依赖id
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.getter = parseExp(exp)
    this.value = this.get()
  }

  get() {
    //给依赖传递watcher
    Dep.target = this
    let value
    const vm = this.vm
    try {
      // 调用getter，收集依赖
      value = this.getter.call(vm, vm)
    } catch (error) {
      console.log(error);
    } finally {
      //重置Dep.target
      Dep.target = null
      this.cleanupDeps()
    }
    return value
  }

  addDep(dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSubs(this)
      }
    }
  }

  cleanupDeps() {
    let temp = this.depIds
    // 保存上次求值收集的依赖id
    this.depIds = this.newDepIds
    this.newDepIds = temp
    // 清空newDepIds，用于收集下次求值依赖
    this.newDepIds.clear()
    // 同理...
    temp = this.deps
    this.deps = this.newDeps
    this.newDeps = temp
    this.newDeps.length = 0
  }

  update() {
    this.invoke(this.cb)
  }

  invoke(cb) {
    const value = this.get()
    const vm = this.vm
    if (value !== this.value) {
      const oldVal = this.value
      this.value = value
      cb.call(vm, oldVal, this.value)
    }
  }
}

export default Watcher