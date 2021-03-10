/* eslint-disable no-console */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const ts = require('typescript');

const utils = require('./utils');
const parser = require('./parser');

const { argv } = yargs(hideBin(process.argv));

const processCode = (code) => {
  const lines = code.split('\n');

  const propertyBag = [];
  let constructorLine = null;

  // eslint-disable-next-line array-callback-return
  const transformedCodeArray = lines.map((line, i) => {
    if (parser.isConstructor(line)) {
      constructorLine = i;
      return parser.replaceConstructorName(line, lines, i);
    }
    if (parser.isDecorator(line)) {
      const [decorator, decoratorArguments] = parser.parseDecorator(line);
      if (decorator === 'UCLASS') {
        return '';
      }
      if (decorator === 'UPROPERTY') {
        // basically now we need to check the next line to see what are we trying to decorate
        // and get the type accordingly
        const nextLine = lines[i + 1];
        const [propertyName, propertyType] = parser.parseTypescriptClassField(
          nextLine,
        );
        propertyBag.push({
          type: propertyType,
          name: propertyName,
          line: i + 1,
          decoratorArguments,
        });
        return '';
      }
    }

    return line;
  });

  const processedCode = parser.injectBootstrap(parser.injectProperties(
    transformedCodeArray,
    propertyBag,
    constructorLine,
  ), argv.file);

  const compiledJavascript = ts.transpileModule(processedCode.join('\n'), {
    compilerOptions: { removeComments: false, target: 'es6' },
  }).outputText;

  utils.writeCode(argv.file, compiledJavascript);
};

if (argv.file) {
  (async () => {
    const code = await utils.readCode(argv.file);
    processCode(code);
  })();
}
