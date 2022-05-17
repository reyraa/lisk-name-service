/* eslint-disable class-methods-use-this */

import {
  AfterBlockApplyContext,
  AfterGenesisBlockApplyContext, BaseModule,
  BeforeBlockApplyContext, TransactionApplyContext
} from 'lisk-sdk';
import { LNSNodeJSON, lnsNodeSchema } from './data/ls_nodes';
import { RegisterAsset } from "./assets/register_asset";
import { ReverseLookupAsset } from "./assets/reverse_lookup_asset";
import { UpdateRecordsAsset } from "./assets/update_records_asset";
import { lsnAccountPropsSchema } from './data/account_props';

export class LnsModule extends BaseModule {
		public actions = {
			// Example below
			// getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
			// getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
			lookupAddress: async (params: Record<string, unknown>): Promise<LNSNodeJSON> => {
				const lnsObject = await lookupAddress({
					accountGetter: this._dataAccess.getAccountByAddress.bind(this),
					chainGetter: this._dataAccess.getChainState.bind(this),
					address: Buffer.from((params as { address: string }).address, 'hex'),
				});

				return codec.toJSON(lnsNodeSchema, lnsObject);
			},
			resolveName: async (params: Record<string, unknown>): Promise<LNSNodeJSON> => {
				const lnsObject = await resolveName({
					chainGetter: this._dataAccess.getChainState.bind(this),
					name: (params as { name: string }).name,
				});
	
				return codec.toJSON(lnsNodeSchema, lnsObject);
			},
			resolveNode: async (params: Record<string, unknown>): Promise<LNSNodeJSON> => {
				const lnsObject = await resolveNode({
					chainGetter: this._dataAccess.getChainState.bind(this),
					node: Buffer.from((params as { node: string }).node, 'hex'),
				});
	
				return codec.toJSON(lnsNodeSchema, lnsObject);
			},
		};
    public reducers = {
			lookupAddress: async (
				params: Record<string, unknown>,
				stateStore: StateStore,
			): Promise<LNSNode> =>
				lookupAddress({
					accountGetter: stateStore.account.get.bind(this),
					chainGetter: stateStore.chain.get.bind(this),
					address: (params as { address: Buffer }).address,
				}),

			resolveName: async (
				params: Record<string, unknown>,
				stateStore: StateStore,
			): Promise<LNSNode> =>
				resolveName({
					chainGetter: stateStore.chain.get.bind(this),
					name: (params as { name: string }).name,
				}),

			resolveNode: async (
				params: Record<string, unknown>,
				stateStore: StateStore,
			): Promise<LNSNode> =>
				resolveNode({
					chainGetter: stateStore.chain.get.bind(this),
					node: (params as { node: Buffer }).node,
				}),
		};
		public name = 'lns';
		public transactionAssets = [
				new RegisterAsset(),
				new ReverseLookupAsset(),
				new UpdateRecordsAsset(),
		];
		public events = [
				// Example below
				// 'lns:newBlock',
		];
		public id = 1000;
		public accountSchema = lsnAccountPropsSchema;

		// public constructor(genesisConfig: GenesisConfig) {
		//     super(genesisConfig);
		// }

		// Lifecycle hooks
		public async beforeBlockApply(_input: BeforeBlockApplyContext) {
				// Get any data from stateStore using block info, below is an example getting a generator
				// const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
		}

		public async afterBlockApply(_input: AfterBlockApplyContext) {
				// Get any data from stateStore using block info, below is an example getting a generator
				// const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
		}

		public async beforeTransactionApply(_input: TransactionApplyContext) {
				// Get any data from stateStore using transaction info, below is an example
				// const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
		}

		public async afterTransactionApply(_input: TransactionApplyContext) {
				// Get any data from stateStore using transaction info, below is an example
				// const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
		}

		public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
				// Get any data from genesis block, for example get all genesis accounts
				// const genesisAccounts = genesisBlock.header.asset.accounts;
		}
}
