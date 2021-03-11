const fs = require('fs').promises;

module.exports = {
  async readCode(file) {
    const data = await fs.readFile(file, 'utf-8');
    return data;
  },
  writeCode(file, data) {
    const target = file.split('.')[0];
    fs.writeFile(`${target}.js`, data, 'utf-8');
  },
  async createDirsRecursive(path) {
    await fs.mkdir(path, { recursive: true });
  },
  getLastPathPart(path) {
    return path.split('/').pop();
  },
  getPathDirs(path, shouldShift = false) {
    const splitPath = path.split('/');
    splitPath.pop();

    if (shouldShift) {
      splitPath.shift();
    }

    return splitPath.join('/');
  },
  calculateRootPath(path) {
    const matches = path.match(/\//g) || [];
    const len = matches.length;

    let pathString = '';

    for (let index = 0; index < len; index += 1) {
      pathString += '../';
    }

    return pathString;
  },
};
