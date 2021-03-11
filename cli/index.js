const actions = require('./actions');

module.exports = (command) => {
  const [action, ...args] = command;
  actions[action](...args);
};
