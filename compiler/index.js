const parser = require('./parser');
const typescript = require('./typescript');

module.exports = (code) => {
  const lines = code.split('\n');

  const propertyBag = [];

  let constructorLine = null;
  let className = null;
  let firstClassReferenceLine = null;
  let classHash = null;
  let replaceSuper = false;

  const transformedCodeArray = lines.map((line, i) => {
    if (parser.isComment(line)) {
      return '';
    }
    if (new RegExp(className).test(line)) {
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
    firstClassReferenceLine + 1,
    className,
  );
  classHash = newClassHash;

  let times = 0;
  const replacedClassReferencesAndSuperCall = processedCode.map((line) => {
    if (new RegExp(className).test(line)) {
      if (times > 0 && !line.startsWith('export')) {
        return line.replace(className, `${className}_${classHash}`);
      }
      times += 1;
    }

    if (/super\(.*\)/.test(line) && replaceSuper) {
      return '';
    }

    return line;
  });

  const compiledJavascript = typescript(replacedClassReferencesAndSuperCall.join('\n'));

  return compiledJavascript;
};
