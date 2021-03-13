const random = require('randomstring');

const DECORATOR_REGEX = /@(.*?)\((.*?)\)/;
const CONSTRUCTOR_REGEX = /constructor\(.*?\) .*/;
const CLASS_HEADER_REGEX = /.*?class (.*?) /;
const UTS_REQUIRE_REGEX = /import .*? from (?:'|")(.*)\.u(?:'|")/;

const buildPropertyMethod = (propertyBag) => {
  const lines = propertyBag.map(
    ({ name, type, decoratorArguments }) => `this.${name}/*${decoratorArguments.join('+')}+${type}*/;`,
  );

  return ['properties() {', ...lines, '}'];
};

const buildCompiledClass = (className) => {
  const hash = random.generate(6);
  return [
    hash,
    `const ${className}_${hash} = require('uclass')()(global, ${className})`,
  ];
};

module.exports = {
  formatKeybindMethod(line, configuration) {
    const noSpaces = line.replace(/ /g, '');
    let result;

    configuration.args.forEach((arg) => {
      result = noSpaces.replace(`${arg.name}:${arg.type}`, `${arg.name} /*${arg.type}*/`);
    });

    const [bindWhat, methodName, event = false] = configuration.decoratorArguments;

    let bindType;
    if (bindWhat === 'BindAxis') {
      bindType = 'AxisBinding';
    } else if (bindWhat === 'BindAction') {
      bindType = 'ActionBinding';
    }

    let additionalArguments;
    if (bindType === 'AxisBinding') {
      additionalArguments = '-bConsumeInput';
    } else if (event && bindType === 'ActionBinding') {
      additionalArguments = event;
    }

    const cleanMethodName = methodName.replace(/'/g, '').replace(/"/g, '');

    const replaceWhat = result.replace(/ /g, '');
    result = result.replace(')', `) /*${bindType}[${cleanMethodName}, ${additionalArguments}]*/`);

    return [result, [replaceWhat, result]];
  },
  injectCompiledClass(code, line, className) {
    const [hash, classLine] = buildCompiledClass(className);
    code.splice(line + 3, 0, ...[null, classLine]);
    return [hash, code];
  },
  replaceClassReferenceToCompiled(className, hash, line) {
    return line.replace(className, `${className}_${hash}`);
  },
  isComment(text) {
    const trimmed = String(text).trimStart();
    return (
      trimmed.startsWith('*')
      || trimmed.startsWith('//')
      || trimmed.startsWith('/*')
      || trimmed.startsWith('*/')
    );
  },
  parseDecorator(decorator) {
    const [, name, decoratorArguments] = decorator.match(DECORATOR_REGEX);
    const splitArguments = decoratorArguments.replace(/ /g, '').split(',');

    return [name, splitArguments];
  },
  convertRequire(line) {
    return line.replace('.u', '');
  },
  isUtsRequire(text) {
    return UTS_REQUIRE_REGEX.test(text);
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
  parseTypescriptMethod(method) {
    const match = method.match(/(.*)\((.*?)\)/);

    const splitMethodHead = match[1].split(' ');
    const methodName = splitMethodHead[splitMethodHead.length - 1];

    const args = match[2]
      .replace(/ /g, '')
      .split(',')
      .map((argument) => ({
        name: argument.split(':')[0],
        type: argument.split(':')[1],
      }));

    return [methodName, args];
  },
  parseTypescriptClassField(field) {
    const cleanedUp = field.replace(/ /g, '');

    const [name, type] = cleanedUp.split(':');
    let cleanType = type.replace(';', '');

    if (/=/.test(cleanType)) {
      // eslint-disable-next-line prefer-destructuring
      cleanType = cleanType.split('=')[0];
    }

    if (cleanType === 'number') {
      cleanType = 'int';
    }

    return [name, cleanType];
  },
  replaceConstructorName(line, codeArray, constructorLine) {
    let shouldReplace = false;

    for (let index = constructorLine; index > 0; index -= 1) {
      const element = codeArray[index];
      if (
        (element.startsWith('class') || element.startsWith('abstract'))
        && this.isDecorator(codeArray[index - 1])
      ) {
        shouldReplace = true;
        break;
      }
    }

    if (shouldReplace) {
      return ['ctor() {', shouldReplace];
    }

    return [line, shouldReplace];
  },
  injectBootstrap(code) {
    code.unshift(
      "Context.RunFile('aliases.js');Context.RunFile('polyfill/unrealengine.js');Context.RunFile('polyfill/timers.js');",
    );
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
