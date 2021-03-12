const colors = require('colors');
const emoji = require('node-emoji');

const logo = `
_    _ _______ _____ 
| |  | |__   __/ ____|
| |  | |  | | | (___  
| |  | |  | |  \\___ \\ 
| |__| |  | |  ____) |
 \\____/   |_| |_____/ 
                    
`;

const logoFormat = () => colors.magenta.bold(logo);
const note = () => colors.cyan.italic(
  `Thank you for using ${colors.magenta.bold('UTS')}! ${emoji.get(
    'heart',
  )} ${emoji.get('coffee')}`,
);

const header = (text) => `${emoji.get('white_check_mark')} ${colors.bgGreen.black(` ${text} `)}`;

function utsInitialized() {
  console.log(`
${header('PROJECT INITIALIZED')}

${logoFormat()}
${note()}
  `);
}

function actorCreated(name) {
  console.log(`
${header('ACTOR CREATED')}

${colors.green('CLASS: ')} ${colors.white(`src/${name}`)}
${logoFormat()}
${note()}`);
}

const attentionHeader = (color) => `${emoji.get('raised_hand')} ${colors[color].black(' Whoa! ')}`;

function warning(text) {
  console.log(`
${attentionHeader('bgYellow')} ${colors.yellow(text)}
  `);
}

function error(text) {
  console.log(`
${attentionHeader('bgRed')} ${colors.red(text)}
  `);
}

function utsWatcherInit() {
  console.log(`
${colors.bgMagenta('UTS Watcher')} Watching ${colors.bold.italic('.u.ts')} files
  `);
}

function tsWatcherInit() {
  console.log(`
${colors.bgCyan('TS Watcher')} Watching ${colors.bold.italic('.ts')} files
    `);
}

function utsCompiling(filename) {
  console.log(`
${colors.bgMagenta('UTS Watcher')} Compiling ${colors.bold.italic(filename)}...
    `);
}

function tsCompiling(filename) {
  console.log(`
${colors.bgCyan('TS Watcher')} Compiling ${colors.bold.italic(filename)}...
      `);
}

module.exports = {
  utsInitialized,
  actorCreated,
  warning,
  error,
  utsWatcherInit,
  tsWatcherInit,
  utsCompiling,
  tsCompiling,
};
