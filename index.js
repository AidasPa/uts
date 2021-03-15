#!/usr/bin/env node

/* eslint-disable no-console */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const cli = require('./cli');

const { argv } = yargs(hideBin(process.argv));

cli(argv._);
