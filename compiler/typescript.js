const ts = require('typescript');

module.exports = (code) => ts.transpileModule(
  code,
  {
    compilerOptions: { removeComments: false, target: 'es6', module: 'commonjs' },
  },
).outputText;
