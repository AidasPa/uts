const fs = require('fs').promises;
const execa = require('execa');
const Listr = require('listr');
const cli = require('../cli');
const make = require('../stubs/make');

const babelDevWatch = 'babel src --out-dir out --copy-files --extensions ".ts" -w';

// eslint-disable-next-line consistent-return
module.exports = async () => {
  // create typings for decorators
  make('typings', [], 'typings/_part_3_ue.d.ts', true);

  // make sure to import the file to the base
  try {
    const mainTypingFile = await fs.readFile('typings/ue.d.ts', 'utf-8');
    const splitTypingFile = mainTypingFile.split('\n');

    let alreadyInjected = false;
    let injectionTarget = null;
    splitTypingFile.forEach((line, i) => {
      if (line === '/// <reference path="_part_3_ue.d.ts">/>') {
        alreadyInjected = true;
      }
      if (line === '/// <reference path="_part_2_ue.d.ts">/>') {
        injectionTarget = i + 1;
      }
    });

    if (!alreadyInjected) {
      splitTypingFile.splice(
        injectionTarget,
        0,
        ...['/// <reference path="_part_3_ue.d.ts">/>'],
      );
    }
    await fs.writeFile('typings/ue.d.ts', splitTypingFile.join('\n'), 'utf-8');
  } catch (error) {
    cli.warning(
      "Are you sure this is an UnrealJS project?\n\nDid you setup UnrealJS in your project's plugins?",
    );
  }

  const tasks = new Listr([
    {
      title: 'Initialize Yarn project',
      task: (ctx, task) => execa(
        'yarn init -y',
      ).catch(() => {
        ctx.yarn = false;
        task.skip('Yarn not available, install it via `npm install -g yarn`');
      }),
    },
    {
      title: 'Add watch script to package.json',
      task: (ctx, task) => execa(
        `npx npm-add-script -k watch -v "${babelDevWatch}"`,
      ).catch(() => {
        ctx.yarn = false;
        task.skip('Maybe it is already there?');
      }),
    },
    {
      title: 'Install package dependencies with Yarn',
      task: (ctx, task) => execa(
        'yarn add @types/node @babel/cli @babel/core @aidaspa/babel-plugin-uts @babel/plugin-proposal-decorators @babel/preset-env @babel/preset-typescript',
      ).catch(() => {
        ctx.yarn = false;

        task.skip('Yarn not available, install it via `npm install -g yarn`');
      }),
    },
    {
      title: 'Initialize Typescript configuration',
      task: (ctx) => execa('npx tsc --init -experimentalDecorators true --target es6').catch(
        () => {
          ctx.tsc = false;
        },
      ),
    },
  ]);

  await make('.gitignore', [], '.gitignore', true);
  await make('.babelrc', [], '.babelrc', true);

  await tasks.run();
  cli.utsInitialized();
};
