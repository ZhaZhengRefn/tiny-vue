import { initMixin } from './init'
import { warn } from '../util/index'

function TinyVue(options) {
  if (process.env.NODE_ENV !== 'production' && !this instanceof TinyVue) {
    warn(`must use new TinyVue`)
  }
  this._init(options)
}

initMixin(TinyVue)

export default TinyVue