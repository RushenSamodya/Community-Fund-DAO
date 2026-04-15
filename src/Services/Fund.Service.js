const { v4: uuidv4 } = require('uuid');
const db = require('./dbHandler');
const Config = require('../Constants/Config');

async function ensurePool(ctx) {
  const poolName = Config.POOL_NAME;
  const existing = await db.get(ctx, 'SELECT id, name, total_amount FROM pool LIMIT 1');
  if (!existing) {
    await db.run(ctx, 'INSERT INTO pool (id, name, total_amount) VALUES (?, ?, ?)', ['default', poolName, 0]);
  }
}

async function getMemberByPubkey(ctx, pubkey) {
  return db.get(ctx, 'SELECT id, name, pubkey, created_at FROM members WHERE pubkey = ?', [pubkey]);
}

async function getMemberTotalContribution(ctx, memberId) {
  const row = await db.get(ctx, 'SELECT COALESCE(SUM(amount), 0) AS total FROM contributions WHERE member_id = ?', [memberId]);
  return row ? row.total : 0;
}

async function getCommunityContributionTotal(ctx) {
  const row = await db.get(ctx, 'SELECT COALESCE(SUM(amount), 0) AS total FROM contributions');
  return row ? row.total : 0;
}

module.exports = {
  async registerMember(ctx, name, pubkey) {
    await ensurePool(ctx);
    const existing = await getMemberByPubkey(ctx, pubkey);
    if (existing) return existing;
    const id = uuidv4();
    const createdAt = Date.now();
    await db.run(ctx, 'INSERT INTO members (id, name, pubkey, created_at) VALUES (?, ?, ?, ?)', [id, name, pubkey, createdAt]);
    return { id, name, pubkey, created_at: createdAt };
  },

  async contribute(ctx, pubkey, amount) {
    await ensurePool(ctx);
    const member = await getMemberByPubkey(ctx, pubkey);
    if (!member) throw new Error('Member not found.');
    const cid = uuidv4();
    const createdAt = Date.now();
    await db.run(ctx, 'INSERT INTO contributions (id, member_id, amount, created_at) VALUES (?, ?, ?, ?)', [cid, member.id, amount, createdAt]);
    // Update pool total.
    await db.run(ctx, 'UPDATE pool SET total_amount = total_amount + ? WHERE id = ?', [amount, 'default']);
    const pool = await db.get(ctx, 'SELECT id, name, total_amount FROM pool WHERE id = ?', ['default']);
    const memberTotal = await getMemberTotalContribution(ctx, member.id);
    return { contribution_id: cid, pool_total: pool.total_amount, member_total: memberTotal };
  },

  async getState(ctx) {
    await ensurePool(ctx);
    const pool = await db.get(ctx, 'SELECT id, name, total_amount FROM pool WHERE id = ?', ['default']);
    const memberCountRow = await db.get(ctx, 'SELECT COUNT(*) AS cnt FROM members');
    const totalContrib = await getCommunityContributionTotal(ctx);
    return { pool, members: memberCountRow ? memberCountRow.cnt : 0, total_contributions: totalContrib };
  },

  getMemberByPubkey,
  getMemberTotalContribution
};
