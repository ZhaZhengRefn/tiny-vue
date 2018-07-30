const babel = require('rollup-plugin-babel')
const rollup = require('rollup')

const inputOptions = {
  input: 'src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    })
  ]
}

const outputOptions = {
  name: 'tinyVue',
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