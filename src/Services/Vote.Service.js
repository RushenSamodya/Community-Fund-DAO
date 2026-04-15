const { v4: uuidv4 } = require('uuid');
const db = require('./dbHandler');
const FundService = require('./Fund.Service');
const ProposalService = require('./Proposal.Service');

module.exports = {
  async castVote(ctx, pubkey, proposalId, voteYes) {
    const proposal = await db.get(ctx, 'SELECT id, status FROM proposals WHERE id = ?', [proposalId]);
    if (!proposal) throw new Error('Proposal not found.');
    if (proposal.status !== 'open') throw new Error('Proposal is not open for voting.');

    const member = await FundService.getMemberByPubkey(ctx, pubkey);
    if (!member) throw new Error('Member not found.');

    const existingVote = await db.get(ctx, 'SELECT id FROM votes WHERE proposal_id = ? AND member_id = ?', [proposalId, member.id]);
    if (existingVote) throw new Error('Member has already voted.');

    const weight = await FundService.getMemberTotalContribution(ctx, member.id);
    const id = uuidv4();
    const createdAt = Date.now();
    await db.run(ctx, 'INSERT INTO votes (id, proposal_id, member_id, vote, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, proposalId, member.id, voteYes ? 1 : 0, weight, createdAt]);

    const finalized = await ProposalService.finalizeProposalIfApproved(ctx, proposalId);
    return { vote_id: id, proposal: finalized };
  }
};
