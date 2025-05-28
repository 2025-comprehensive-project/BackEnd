const fs = require('fs');
const path = require('path');

const LOG_BASE_DIR = path.join(__dirname, '../../../web/logs/train');
const validTypes = ['base', 'lora', 'rola'];

const getLogList = () => {
  const result = {};

  for (const type of validTypes) {
    const dirPath = path.join(LOG_BASE_DIR, type);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.log'));
    result[type] = files;
  }

  return result;
};

const getLogContent = (type, filename) => {
  if (!validTypes.includes(type)) throw new Error('INVALID_TYPE');
  if (!filename.endsWith('.log')) throw new Error('INVALID_FILENAME');
  const filePath = path.join(LOG_BASE_DIR, type, filename);
  if (!fs.existsSync(filePath)) throw new Error('LOG_NOT_FOUND');
  return fs.readFileSync(filePath, 'utf-8');
};

module.exports = {
  getLogList,
  getLogContent,
};
