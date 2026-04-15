const ResponseHelper = require('../Utils/Response.Helper');
const ProposalService = require('../Services/Proposal.Service');

module.exports = {
  async create(ctx, payload) {
    try {
      const { pubkey, title, description, amount, target } = payload || {};
      if (!pubkey || !title || !target || !Number.isInteger(amount) || amount <= 0) {
        return ResponseHelper.error('Missing required fields for proposal.');
      }
      const proposal = await ProposalService.createProposal(ctx, pubkey, title, description || '', amount, target);
      return ResponseHelper.success(proposal, 'Proposal created.');
    } catch (e) {
      ctx.log('createProposal error: ' + e.message);
      return ResponseHelper.error('Failed to create proposal.');
    }
  },

  async list(ctx) {
    try {
      const list = await ProposalService.listProposals(ctx);
      return ResponseHelper.success(list, 'Proposals list.');
    } catch (e) {
      ctx.log('listProposals error: ' + e.message);
      return ResponseHelper.error('Failed to list proposals.');
    }
  }
};
