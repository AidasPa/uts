/* eslint-disable no-console */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const utils = require('./utils');
const compiler = require('./compiler');
const cli = require('./cli');

const { argv } = yargs(hideBin(process.argv));

if (argv.file) {
  (async () => {
    const code = await utils.readCode(argv.file);
    const compiled = compiler(code);
    utils.writeCode(argv.file, compiled);
  })();
} else {
  cli(argv._);
}
