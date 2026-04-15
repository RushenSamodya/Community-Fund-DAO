const ResponseHelper = require('../Utils/Response.Helper');
const VoteService = require('../Services/Vote.Service');

module.exports = {
  async cast(ctx, payload) {
    try {
      const { pubkey, proposalId, vote } = payload || {};
      if (!pubkey || !proposalId || typeof vote !== 'boolean') {
        return ResponseHelper.error('Missing pubkey, proposalId or vote.');
      }
      const result = await VoteService.castVote(ctx, pubkey, proposalId, vote);
      return ResponseHelper.success(result, 'Vote recorded.');
    } catch (e) {
      ctx.log('castVote error: ' + e.message);
      return ResponseHelper.error('Failed to cast vote.');
    }
  }
};
