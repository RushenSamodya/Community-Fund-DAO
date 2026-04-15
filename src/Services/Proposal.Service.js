const { v4: uuidv4 } = require('uuid');
const db = require('./dbHandler');
const FundService = require('./Fund.Service');

module.exports = {
  async createProposal(ctx, creatorPubkey, title, description, amount, target) {
    const member = await FundService.getMemberByPubkey(ctx, creatorPubkey);
    if (!member) throw new Error('Member not found.');

    const pool = await db.get(ctx, 'SELECT id, name, total_amount FROM pool WHERE id = ?', ['default']);
    if (!pool) throw new Error('Pool not initialized.');
    if (amount > pool.total_amount) throw new Error('Requested amount exceeds pool total.');

    const id = uuidv4();
    const createdAt = Date.now();
    await db.run(ctx, 'INSERT INTO proposals (id, creator_id, title, description, amount, target, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, member.id, title, description, amount, target, 'open', createdAt]);
    return { id, creator_id: member.id, title, description, amount, target, status: 'open', created_at: createdAt };
  },

  async listProposals(ctx) {
    const rows = await db.all(ctx, 'SELECT id, creator_id, title, description, amount, target, status, created_at, finalized_at FROM proposals ORDER BY created_at DESC');
    return rows || [];
  },

  async finalizeProposalIfApproved(ctx, proposalId) {
    const proposal = await db.get(ctx, 'SELECT id, amount, target, status FROM proposals WHERE id = ?', [proposalId]);
    if (!proposal || proposal.status !== 'open') return null;
    const votes = await db.all(ctx, 'SELECT vote, weight FROM votes WHERE proposal_id = ?', [proposalId]);
    const yesWeight = votes.filter(v => v.vote === 1).reduce((a, b) => a + (b.weight || 0), 0);
    const totalCommunity = await db.get(ctx, 'SELECT COALESCE(SUM(amount), 0) AS total FROM contributions');
    const total = totalCommunity ? totalCommunity.total : 0;

    const threshold = require('../Constants/Config').VOTING_THRESHOLD;
    const approved = total > 0 && (yesWeight / total) >= threshold;

    if (approved) {
      // Deduct from pool & record allocation.
      await db.run(ctx, 'UPDATE pool SET total_amount = total_amount - ? WHERE id = ?', [proposal.amount, 'default']);
      const allocId = uuidv4();
      const executedAt = Date.now();
      await db.run(ctx, 'INSERT INTO allocations (id, proposal_id, amount, target, executed_at) VALUES (?, ?, ?, ?, ?)', [allocId, proposalId, proposal.amount, proposal.target, executedAt]);
      await db.run(ctx, 'UPDATE proposals SET status = ?, finalized_at = ? WHERE id = ?', ['executed', executedAt, proposalId]);
      return { status: 'executed', allocation_id: allocId };
    }
    return { status: 'open' };
  }
};
