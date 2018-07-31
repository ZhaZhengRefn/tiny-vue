import { mergeOptions } from '../util/index'

let uid = 0

export function initMixin(TinyVue) {
  TinyVue.prototype._init = function(options) {
    const vm = this
    // 避免组件被observe
    vm._isVue = true
    // 合并options
    vm.$options = mergeOptions(
      vm.constructor.options,//简化逻辑，由此TinyVue不支持Vue.extend扩展子类，因此直接合并全局api中的options
      options,//当前传入的options
      vm//实例本身
    )
  }
}