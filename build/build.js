const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')
const rollup = require('rollup')
const version = process.env.VERSION || require('../package.json').version

const inputOptions = {
  input: 'src/index.js',
  plugins: [
    replace({
      [`process.env.NODE_ENV`]: process.env.NODE_ENV,
      __VERSION__: version,
    }),
    babel({
      exclude: 'node_modules/**',
    })
  ]
}

const outputOptions = {
  name: 'TinyVue',
  file: './dist/index.js',
  format: 'umd',
}

const build = async function() {
  const bundle = await rollup.rollup(inputOptions)

  const {
    code,
    map,
  } = await bundle.generate(outputOptions)

  await bundle.write(outputOptions)
}

build()