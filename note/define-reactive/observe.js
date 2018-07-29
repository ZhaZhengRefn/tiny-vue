import Dep from "./dep";

/**
 * Observer
 * 事先定义getter, setter，以及收集依赖逻辑。
 * 当新建watcher时即会触发getter，由此通知依赖收集器是否应收集当前的watcher。
 */
class Observer {
  constructor(value) {
    this.value = value
    // this.dep = new Dep()
    this.walk(this.value)
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

export const defineReactive = function (obj, key, val) {
  const dep = new Dep()//此处为当前键值对的依赖收集器

  // let childOb = observe(val) //递归调用observe，若不为对象则会return

  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        // if (childOb) {
        //   childOb.dep.depend()
        // }
      }
      return val
    },
    set(newVal) {
      val = newVal
      // childOb = observe(val)
      dep.notify()
      return val
    }
  })
}

export const observe = function (value) {
  if (typeof value !== 'object' || value == null) return
  return new Observer(value)
}