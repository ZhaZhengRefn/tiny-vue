let uid = 0

const remove = (arr, val) => {
  if (arr.length) {
    const index = arr.indexOf(val)
    if (index > -1) {
      arr.splice(index, 1)
    }
  }
}

/**
 * 依赖集合
 * Dep.target相当于一个全局变量，缓存观察者。当触发数据的getter时，调用depend，让watcher收集此依赖
 */
class Dep {
  constructor() {
    this.id = uid++
    this.subscribes = []
  }

  addSubs(watcher) {
    this.subscribes.push(watcher)
  }

  delSubs(watcher) {
    remove(this.subscribes, watcher)
  }

  /**
   * 事先init数据中的响应式getter, setter。
   * new Watcher时将会触发getter以收集依赖。
   * Watcher挂载到Dep.target静态属性上，然后触发已定义的getter。
   * 在触发事先定义的响应式getter后，getter再通知本依赖收集器是否应该收集此依赖。
   * 调用watcher的addDep后，由watcher中的逻辑过滤重复收集的依赖。
   * 判断不为重复收集的依赖则会回来调用收集器的addSubs。
   * 依赖收集完成。
   */
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify() {
    // 触发所有的watcher
    this.subscribes.slice().forEach(sub => {
      sub.update()
    })
  }
}

Dep.target = null

export default Dep