const chokidar = require('chokidar');
const fs = require('fs').promises;
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

  cli.tsWatcherInit();
  cli.utsWatcherInit();
  console.log('-----------------------------------------------');
  chokidar.watch('src').on('all', async (event, path) => {
    const file = path.replace(/\\/g, '/');

    const target = `out/${utils.getPathDirs(file, true)}`;

    if (file.split('.')[1] === 'uts' || file.split('.')[1] === 'ts') {
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

      if (fileType === 'uts') {
        cli.utsCompiling(`${file}`);
        compiled = compiler(code);
      } else if (fileType === 'ts') {
        cli.tsCompiling(file);
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
