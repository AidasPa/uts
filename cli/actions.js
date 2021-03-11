const colors = require('colors');
const watch = require('./actions/watch');

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

      console.log(colors.green('UTS project initialized!'));
    } catch (error) {
      console.log(colors.yellow('Are you sure this is an Unreal.JS project?'));
    }
  },
  'create:actor': async (className) => {
    make('actor', [['CLASSNAME', className]], `${className}.uts`);
  },
};
