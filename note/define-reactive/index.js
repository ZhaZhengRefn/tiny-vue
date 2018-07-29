import {
  observe,
} from './observe'
import Watcher from './watch'

export const watch = function(data, exp, fn) {
  observe(data)
  const watcher = new Watcher(data, exp, fn)
}