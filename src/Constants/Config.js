const fs = require('fs');
const path = require('path');

let settings = {};
try {
  const settingsPath = path.join(__dirname, '..', 'settings.json');
  const data = fs.readFileSync(settingsPath, 'utf-8');
  settings = JSON.parse(data);
} catch (e) {
  settings = {};
}

module.exports = {
  DB_PATH: process.env.DB_PATH || settings.DB_PATH || 'communityfund.db',
  POOL_NAME: process.env.POOL_NAME || settings.POOL_NAME || 'Community Fund',
  VOTING_THRESHOLD: Number(process.env.VOTING_THRESHOLD || settings.VOTING_THRESHOLD || 0.6),
  CONTRACT_FS: '.'
};
