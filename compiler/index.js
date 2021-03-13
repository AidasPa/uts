const parser = require('./parser');
const typescript = require('./typescript');

module.exports = (code) => {
  const lines = code.split('\n');

  const propertyBag = [];
  const thingsToReplaceAfterTypescript = [];

  let constructorLine = null;
  let className = null;
  let firstClassReferenceLine = null;
  let classHash = null;
  let replaceSuper = false;

  let keybindConfiguration = null;
  let keybindMethodLine = null;

  const transformedCodeArray = lines.map((line, i) => {
    if (i === keybindMethodLine) {
      keybindMethodLine = null;
      const [result, whatToReplaceAfterTypescript] = parser.formatKeybindMethod(
        line,
        keybindConfiguration,
      );

      thingsToReplaceAfterTypescript.push(whatToReplaceAfterTypescript);

      return result;
    }
    if (parser.isUtsRequire(line)) {
      return parser.convertRequire(line);
    }
    if (parser.isComment(line)) {
      return '';
    }
    if (
      new RegExp(`new ${className}`).test(line)
      || new RegExp(`export .*? ${className}`).test(line)
    ) {
      if (firstClassReferenceLine === null) {
        firstClassReferenceLine = i - 1;
      }
      return line;
    }
    if (parser.isClassHeader(line)) {
      className = parser.parseClassName(line);
      return line;
    }
    if (parser.isConstructor(line)) {
      constructorLine = i;
      const [replaced, didReplace] = parser.replaceConstructorName(
        line,
        lines,
        i,
      );
      if (didReplace) {
        replaceSuper = true;
      }
      return replaced;
    }
    if (parser.isDecorator(line)) {
      const [decorator, decoratorArguments] = parser.parseDecorator(line);
      if (decorator === 'UCLASS') {
        return '';
      }
      if (decorator === 'KEYBIND') {
        keybindMethodLine = i + 1;

        // check to what method are we assigning the keybind to
        const nextLine = lines[i + 1];
        const [methodName, args] = parser.parseTypescriptMethod(nextLine);
        keybindConfiguration = {
          method: methodName,
          args,
          line: i + 1,
          decoratorArguments,
        };
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

  const [newClassHash, processedCode] = parser.injectCompiledClass(
    parser.injectBootstrap(
      parser.injectProperties(
        transformedCodeArray,
        propertyBag,
        constructorLine,
      ),
    ),
    firstClassReferenceLine + 1 + propertyBag.length,
    className,
  );
  classHash = newClassHash;

  // let times = 0;
  const replacedClassReferencesAndSuperCall = processedCode.map((line) => {
    if (new RegExp(className).test(line) && (/new/.test(line) || /export/.test(line))) {
      console.log(line);
      // if (times > 0) {
        return line.replace(className, `${className}_${classHash}`);
      // }
      // times += 1;
    }

    if (/super\(.*\)/.test(line) && replaceSuper) {
      return '';
    }

    return line;
  });

  const compiledJavascript = typescript(
    replacedClassReferencesAndSuperCall.join('\n'),
  );

  const replacedJavascript = compiledJavascript.split('\n').map((line) => {
    const noSpaces = line.replace(/ /g, '').replace(/\r/g, '');

    let result = line;

    // eslint-disable-next-line consistent-return
    thingsToReplaceAfterTypescript.forEach(([target, replacement]) => {
      if (target === noSpaces) {
        // eslint-disable-next-line no-return-assign
        return result = replacement;
      }
    });

    return result;
  }).join('\n');

  return replacedJavascript.replace(
    'Object.defineProperty(exports, "__esModule", { value: true });',
    '',
  );
};
