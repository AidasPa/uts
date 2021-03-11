const fs = require('fs').promises;
const colors = require('colors');
const Quote = require('inspirational-quotes');
const utils = require('../../utils');
const cli = require('../cli');

module.exports = async (stubName, argArray, filePath, skipSrc = false) => {
  const rawStub = await fs.readFile(`${__dirname}/${stubName}.stub`, 'utf-8');

  let finalPath = `src/${filePath}`;
  if (skipSrc) {
    finalPath = filePath;
  }

  let computedStub = rawStub;
  argArray.forEach(([key, value]) => {
    const regexp = new RegExp(`__${key}__`, 'g');
    computedStub = computedStub.replace(regexp, value);
  });

  computedStub = computedStub
    .replace('__QUOTE__', Quote.getRandomQuote())
    .replace('__ROOTPATH__', utils.calculateRootPath(finalPath));

  try {
    const directory = utils.getPathDirs(finalPath);

    await utils.createDirsRecursive(directory);
    await fs.writeFile(`${finalPath}`, computedStub, 'utf-8');
  } catch (error) {
    console.log(error);
    cli.error(`Did you run ${colors.bold.white('uts init')}?`);
  }
};
