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
};
