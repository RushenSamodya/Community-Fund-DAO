const hpc = require('hotpocket-nodejs-contract');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ResponseHelper = require('./Utils/Response.Helper');
const Config = require('./Constants/Config');
const initDB = require('./Data.Deploy/initDB');
const FundController = require('./Controllers/Fund.Controller');
const ProposalController = require('./Controllers/Proposal.Controller');
const VoteController = require('./Controllers/Vote.Controller');

async function contract(ctx) {
  try {
    ctx.log('CommunityFund contract starting...');

    // Initialize DB schema if needed.
    await initDB(ctx);

    // Process user messages for this round.
    const messages = (typeof ctx.getUserMessages === 'function') ? await ctx.getUserMessages() : [];

    for (const umsg of messages) {
      try {
        const user = umsg.user || umsg.client || umsg.sender || null;
        const payloadBuffer = umsg.payload || umsg.message || umsg.data || null;
        if (!user || !payloadBuffer) {
          continue;
        }

        let msgObj = null;
        try {
          const str = payloadBuffer.toString();
          msgObj = JSON.parse(str);
        } catch (e) {
          const resp = ResponseHelper.error('Invalid JSON payload.');
          await hpc.sendResponse(user, Buffer.from(JSON.stringify(resp)));
          continue;
        }

        if (msgObj.type !== 'action') {
          const resp = ResponseHelper.error('Unsupported message type.');
          await hpc.sendResponse(user, Buffer.from(JSON.stringify(resp)));
          continue;
        }

        let resp = null;
        switch (msgObj.action) {
          case 'register_member':
            resp = await FundController.registerMember(ctx, msgObj.payload);
            break;
          case 'contribute':
            resp = await FundController.contribute(ctx, msgObj.payload);
            break;
          case 'create_proposal':
            resp = await ProposalController.create(ctx, msgObj.payload);
            break;
          case 'vote':
            resp = await VoteController.cast(ctx, msgObj.payload);
            break;
          case 'get_state':
            resp = await FundController.getState(ctx);
            break;
          case 'list_proposals':
            resp = await ProposalController.list(ctx);
            break;
          default:
            resp = ResponseHelper.error('Unknown action.');
        }

        await hpc.sendResponse(user, Buffer.from(JSON.stringify(resp)));
      } catch (innerErr) {
        ctx.log('Message handling error: ' + innerErr.message);
      }
    }

    ctx.log('CommunityFund contract round complete.');
  } catch (err) {
    ctx.log('Contract error: ' + err.message);
  }
}

hpc.init(contract);
