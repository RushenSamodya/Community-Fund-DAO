const crypto = require('crypto');

module.exports = {
  sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
};
