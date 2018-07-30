// import {  } from './index'
const {watch} = require('./dist/')

const data = {
  a: 1,
  foo: {
    bar: '1'
  }
}

watch(data, 'a', (old, newVal) => {
  console.log('a has been change\n' +
    `old: ${old}\n` +
    `newVal: ${newVal}\n`
  );
})
watch(data, 'foo', (old, newVal) => {
  console.log('foo has been change\n' +
    `old: ${old}\n` +
    `newVal: ${newVal}\n`
  );
})

data.a = 2
data.foo.bar = 3