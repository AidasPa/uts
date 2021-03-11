const colors = require('colors');
const filewatcher = require('filewatcher');
const fs = require('fs').promises;
const compiler = require('../compiler');
const typescript = require('../compiler/typescript');
const utils = require('../utils');
const make = require('./stubs/make');

const removeFileFromPathString = (path) => {
  const split = path.split('/');
  split.pop();
  return split.join('/');
};

module.exports = {
  watch: () => {
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
  },
  init: async () => {
    // create typings for decorators
    make('typings', [], 'typings/_part_3_ue.d.ts');

    // make sure to import the file to the base
    try {
      const mainTypingFile = await fs.readFile('typings/ue.d.ts', 'utf-8');
      const splitTypingFile = mainTypingFile.split('\n');

      let injectionTarget = null;
      splitTypingFile.forEach((line, i) => {
        if (line === '/// <reference path="_part_2_ue.d.ts">/>') {
          injectionTarget = i + 1;
        }
      });

      splitTypingFile.splice(injectionTarget, 0, ...['/// <reference path="_part_3_ue.d.ts">/>']);
      await fs.writeFile('typings/ue.d.ts', splitTypingFile.join('\n'), 'utf-8');

      console.log(colors.green('UTS project initialized!'));
    } catch (error) {
      console.log(colors.yellow('Are you sure this is an Unreal.JS project?'));
    }
  },
  'create:actor': async (className) => {
    make('actor', [['CLASSNAME', className]], `${className}.uts`);
  },
};
