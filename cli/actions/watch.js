const filewatcher = require('filewatcher');
const colors = require('colors');
const fs = require('fs').promises;
const compiler = require('../../compiler');
const typescript = require('../../compiler/typescript');
const utils = require('../../utils');

const removeFileFromPathString = (path) => {
  const split = path.split('/');
  split.pop();
  return split.join('/');
};

module.exports = () => {
  // eslint-disable-next-line global-require
  const glob = require('glob');

  const watcher = filewatcher();
  const typescriptWatcher = filewatcher();

  glob('**/*.ts', (err, matches) => {
    matches.forEach((match) => typescriptWatcher.add(match));
  });

  glob('**/*.uts', (err, matches) => {
    matches.forEach((match) => watcher.add(match));
  });

  console.log(`[${colors.bold.magenta('UTS')}] Watching ${colors.cyan.italic('.uts files')}...`);
  console.log(`[${colors.bold.cyan('TS')}] Watching ${colors.cyan.italic('.ts files')}...`);

  typescriptWatcher.on('change', async (file, stat) => {
    if (stat) {
      console.log(`[${colors.bold.cyan('TS')}] Compiling ${colors.cyan.italic(file)}...`);
      const code = await utils.readCode(file);
      const compiled = typescript(code);

      try {
        await fs.mkdir(`out/${removeFileFromPathString(file)}`, { recursive: true });
      } catch (error) {
        // silent
      }

      utils.writeCode(`out/${file}`, compiled);
    } else {
      fs.unlink(`out/${file}`);
    }
  });

  watcher.on('change', async (file, stat) => {
    if (stat) {
      console.log(`[${colors.bold.magenta('UTS')}] Compiling ${colors.cyan.italic(file)}...`);
      const code = await utils.readCode(file);
      const compiled = compiler(code);

      try {
        await fs.mkdir(`out/${removeFileFromPathString(file)}`, { recursive: true });
      } catch (error) {
        // silent
      }

      utils.writeCode(`out/${file}`, compiled);
    } else {
      fs.unlink(`out/${file}`);
    }
  });
};
