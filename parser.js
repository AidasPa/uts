const random = require('randomstring');

const DECORATOR_REGEX = /@(.*?)\((.*?)\)/;
const CONSTRUCTOR_REGEX = /constructor\(.*?\) .*/;
const CLASS_HEADER_REGEX = /class (.*?) /;

const buildPropertyMethod = (propertyBag) => {
  const lines = propertyBag.map(
    ({ name, type, decoratorArguments }) => `this.${name}/*${decoratorArguments.join('+')}+${type}*/;`,
  );

  return ['properties() {', ...lines, '}'];
};

const buildCompiledClass = (className) => {
  const hash = random.generate(6);
  return [hash, `const ${className} = require('uclass')()(global, ${className})`];
};

module.exports = {
  injectCompiledClass(code, line, className) {
    const [hash, classLine] = buildCompiledClass(className);
    code.splice(line + 5, 0, classLine);
    console.log(code);
    return [hash, code];
  },
  replaceClassReferenceToCompiled(className, hash, line) {
    return line.replace(className, `${className}_${hash}`);
  },
  isComment(text) {
    const trimmed = String(text).trimStart();
    return trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*/');
  },
  parseDecorator(decorator) {
    const [, name, decoratorArguments] = decorator.match(DECORATOR_REGEX);
    const splitArguments = decoratorArguments.replace(/ /g, '').split(',');

    return [name, splitArguments];
  },
  isDecorator(text) {
    return DECORATOR_REGEX.test(text);
  },
  isConstructor(text) {
    return CONSTRUCTOR_REGEX.test(text);
  },
  isClassHeader(text) {
    return CLASS_HEADER_REGEX.test(text);
  },
  parseClassName(header) {
    const [, name] = header.match(CLASS_HEADER_REGEX);
    return name;
  },
  parseTypescriptClassField(field) {
    const cleanedUp = field.replace(/ /g, '');

    const [name, type] = cleanedUp.split(':');
    const cleanType = type.replace(';', '');

    return [name, cleanType];
  },
  replaceConstructorName(line, codeArray, constructorLine) {
    let shouldReplace = false;

    for (let index = constructorLine; index > 0; index -= 1) {
      const element = codeArray[index];
      if (
        element.startsWith('class')
        && this.isDecorator(codeArray[index - 1])
      ) {
        shouldReplace = true;
        break;
      }
    }

    if (shouldReplace) {
      return line.replace('constructor', 'ctor');
    }

    return line;
  },
  injectBootstrap(code) {
    code.unshift(`
      Context.RunFile('aliases.js');\n
      Context.RunFile('polyfill/unrealengine.js');\n
      Context.RunFile('polyfill/timers.js');\n
    `);
    return code;
  },
  injectProperties(code, propertyBag, targetLine) {
    if (code[targetLine].replace(/ /g, '') !== '') {
      return this.injectProperties(code, propertyBag, targetLine - 1);
    }

    if (targetLine !== null) {
      code.splice(targetLine - 1, 0, ...buildPropertyMethod(propertyBag));
    }

    return code;
  },
};
