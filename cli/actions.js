const fs = require('fs').promises;
const watch = require('./actions/watch');
const cli = require('./cli');

const make = require('./stubs/make');

module.exports = {
  watch,
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

      cli.utsInitialized();
    } catch (error) {
      cli.warning('Are you sure this is an UnrealJS project?\n\nDid you setup UnrealJS in your project\'s plugins?');
    }
  },
  'create:actor': async (className) => {
    make('actor', [['CLASSNAME', className]], `${className}.uts`);
    cli.actorCreated(`${className}.uts`);
  },
};
