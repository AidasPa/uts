const chokidar = require('chokidar');
const fs = require('fs').promises;
const cli = require('../cli');
const compiler = require('../../compiler');
const typescript = require('../../compiler/typescript');
const utils = require('../../utils');

module.exports = () => {
  cli.tsWatcherInit();
  cli.utsWatcherInit();
  console.log('-----------------------------------------------');
  // eslint-disable-next-line consistent-return
  chokidar.watch('src').on('all', async (event, path) => {
    const file = path.replace(/\\/g, '/');

    const target = `out/${utils.getPathDirs(file, true)}`;

    if (file.split('.')[1] === 'u' || file.split('.')[1] === 'ts') {
      if (event === 'unlink') {
        return fs.unlink(`${target}/${utils.getLastPathPart(file.split('.')[0])}.js`);
      }
      const fileType = file.split('.')[1];
      const code = await utils.readCode(file);

      try {
        await utils.createDirsRecursive(target);
      } catch (error) {
        // silently fail
      }

      let compiled;

      try {
        if (fileType === 'u') {
          cli.utsCompiling(`${file}`);
          compiled = compiler(code);
        } else if (fileType === 'ts') {
          cli.tsCompiling(file);
          compiled = typescript(code);
        }
      } catch (error) {
        cli.error(`There were errors when compiling ${file}`);
      }

      await utils.writeCode(
        `out/${utils.getPathDirs(file, true)}/${utils.getLastPathPart(
          file.split('.')[0],
        )}.js`,
        compiled,
      );
    } else {
      // cli.error(`Should delete ${file}`);
    }
  });
};
