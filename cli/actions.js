const watch = require('./actions/watch');
const init = require('./actions/init');
const cli = require('./cli');
const utils = require('../utils');
const make = require('./stubs/make');

module.exports = {
  watch,
  init,
  'create:actor': async (className) => {
    make('actor', [['CLASSNAME', utils.getLastPathPart(className)]], `${className}.u.ts`);
    cli.actorCreated(`${className}.u.ts`);
  },
};
