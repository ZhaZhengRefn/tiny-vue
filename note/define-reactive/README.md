# define-reactive
长期目标是自己实现一份vue。第一步先实现数据劫持。
初步目标是：
1.如下有个承载数据的data对象；
2.引用watch方法，可以监听其中某个key的值得变化。

# 语法
```js
import {
  watch,
} from './watch'

const data = {
  a: 1,
  foo: 'bar'
}

watch(data, 'foo', (old, newVal) => {
  console.log(old, newVal)
})

```