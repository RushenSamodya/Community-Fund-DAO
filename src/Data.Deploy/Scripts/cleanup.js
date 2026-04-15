const db = require('../../Services/dbHandler');

module.exports = async function cleanup(ctx) {
  await db.run(ctx, 'DROP TABLE IF EXISTS allocations');
  await db.run(ctx, 'DROP TABLE IF EXISTS votes');
  await db.run(ctx, 'DROP TABLE IF EXISTS proposals');
  await db.run(ctx, 'DROP TABLE IF EXISTS contributions');
  await db.run(ctx, 'DROP TABLE IF EXISTS members');
  await db.run(ctx, 'DROP TABLE IF EXISTS pool');
};
