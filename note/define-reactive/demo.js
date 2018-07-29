// import {  } from './index'
const {watch} = require('./dist/')

const data = {
  a: 1,
}

watch(data, 'a', (old, newVal) => {
  console.log('a has been change');
  console.log('old: ', old);
  console.log('newVal: ', newVal);
})

data.a = 2
data.a = 3
data.a = 4