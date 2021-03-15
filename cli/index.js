const actions = require('./actions');
const cli = require('./cli');

module.exports = (command) => {
  const [action, ...args] = command;
  try {
    actions[action](...args);
  } catch (error) {
    cli.error('Command not found!');
  }
};
