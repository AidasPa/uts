const chokidar = require('chokidar');
const cli = require('../cli');
const compiler = require('../../compiler');
const typescript = require('../../compiler/typescript');
const utils = require('../../utils');

module.exports = () => {
  // glob('src/**/*.ts', (err, matches) => {
  //   matches.forEach((match) => typescriptWatcher.add(match));
  // });

  // glob('src/**/*.uts', (err, matches) => {
  //   matches.forEach((match) => watcher.add(match));
  // });

  chokidar.watch('src').on('all', async (event, path) => {
    const file = path.replace(/\\/g, '/');

    if (file.split('.')[1] === 'uts' || file.split('.')[1] === 'ts') {
      const fileType = file.split('.')[1];
      const code = await utils.readCode(file);

      try {
        await utils.createDirsRecursive(`out/${utils.getPathDirs(file, true)}`);
      } catch (error) {
        // silently fail
      }

      let compiled;

      if (fileType === 'uts') {
        compiled = compiler(code);
      } else if (fileType === 'ts') {
        compiled = typescript(code);
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
