import babel from 'rollup-plugin-babel';

export default {
  input: './index.js',
  output: {
    name: 'tinyVue',
    file: './dist/index.js',
    format: 'iife'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // 只编译我们的源代码
    })
  ]
};