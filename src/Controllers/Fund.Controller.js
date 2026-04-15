const ResponseHelper = require('../Utils/Response.Helper');
const FundService = require('../Services/Fund.Service');

module.exports = {
  async registerMember(ctx, payload) {
    try {
      const { name, pubkey } = payload || {};
      if (!name || !pubkey) {
        return ResponseHelper.error('Missing name or pubkey.');
      }
      const member = await FundService.registerMember(ctx, name, pubkey);
      return ResponseHelper.success(member, 'Member registered.');
    } catch (e) {
      ctx.log('registerMember error: ' + e.message);
      return ResponseHelper.error('Failed to register member.');
    }
  },

  async contribute(ctx, payload) {
    try {
      const { pubkey, amount } = payload || {};
      if (!pubkey || !Number.isInteger(amount) || amount <= 0) {
        return ResponseHelper.error('Invalid pubkey or amount.');
      }
      const result = await FundService.contribute(ctx, pubkey, amount);
      return ResponseHelper.success(result, 'Contribution recorded.');
    } catch (e) {
      ctx.log('contribute error: ' + e.message);
      return ResponseHelper.error('Failed to record contribution.');
    }
  },

  async getState(ctx) {
    try {
      const state = await FundService.getState(ctx);
      return ResponseHelper.success(state, 'Current state.');
    } catch (e) {
      ctx.log('getState error: ' + e.message);
      return ResponseHelper.error('Failed to get state.');
    }
  }
};
