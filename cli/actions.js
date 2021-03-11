const camelCase = require('camel-case');
const make = require('./stubs/make');

module.exports = {
  'create:actor': async (className) => {
    make('actor', [['CLASSNAME', className]], `actors/${camelCase.camelCase(className)}`);
  },
};
