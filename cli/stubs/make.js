const fs = require('fs').promises;
const colors = require('colors');

module.exports = async (stubName, argArray, filePath) => {
  const rawStub = await fs.readFile(`${__dirname}/${stubName}.stub`, 'utf-8');

  let computedStub = rawStub;
  argArray.forEach(([key, value]) => {
    const regexp = new RegExp(`__${key}__`, 'g');
    computedStub = computedStub.replace(regexp, value);
  });

  try {
    await fs.writeFile(`./${filePath}`, computedStub, 'utf-8');
  } catch (error) {
    console.log(colors.red(`Did you run ${colors.bold.white('uts init')}?`));
  }
};
