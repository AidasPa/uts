const DECORATOR_REGEX = /@(.*?)\((.*?)\)/;
const CONSTRUCTOR_REGEX = /constructor\(.*?\) .*/;

const buildPropertyMethod = (propertyBag) => {
  const lines = propertyBag.map(
    ({ name, type, decoratorArguments }) => `this.${name}/*${decoratorArguments.join('+')}+${type}*/;`,
  );

  return ['properties() {', lines, '}'];
};

module.exports = {
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
  injectBootstrap(code, filename) {
    const target = filename.split('.')[0].split('/');
    const targetFinalPath = target[target.length - 1];

    code.push(`const bootstrap = require('./bootstrap'); bootstrap('${targetFinalPath}');`);
    return code;
  },
  injectProperties(code, propertyBag, targetLine) {
    if (targetLine !== null) {
      code.splice(targetLine - 1, 0, ...buildPropertyMethod(propertyBag));
    }

    return code;
  },
};
