const db = require('../Services/dbHandler');
const Config = require('../Constants/Config');

module.exports = async function initDB(ctx) {
  // Members
  await db.run(ctx, `CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pubkey TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL
  )`);

  // Contributions
  await db.run(ctx, `CREATE TABLE IF NOT EXISTS contributions (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(member_id) REFERENCES members(id)
  )`);

  // Pool
  await db.run(ctx, `CREATE TABLE IF NOT EXISTS pool (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_amount INTEGER NOT NULL
  )`);

  // Proposals
  await db.run(ctx, `CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    target TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    finalized_at INTEGER,
    FOREIGN KEY(creator_id) REFERENCES members(id)
  )`);

  // Votes
  await db.run(ctx, `CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    vote INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(proposal_id) REFERENCES proposals(id),
    FOREIGN KEY(member_id) REFERENCES members(id)
  )`);

  // Allocations
  await db.run(ctx, `CREATE TABLE IF NOT EXISTS allocations (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    target TEXT NOT NULL,
    executed_at INTEGER NOT NULL,
    FOREIGN KEY(proposal_id) REFERENCES proposals(id)
  )`);
};
