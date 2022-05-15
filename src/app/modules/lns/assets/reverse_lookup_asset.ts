import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { ReverseLookupAssetProps, reverseLookupAssetPropsSchema } from '../data/asset/reverse_lookup';
import { getNodeForName } from '../storage';
import { LNSAccountProps } from '../data/account_props';

export class ReverseLookupAsset extends BaseAsset<ReverseLookupAssetProps> {
	public name = 'reverseLookup';
  public id = 2;

  // Define schema for asset
	public schema = reverseLookupAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<ReverseLookupAssetProps>): void {
    // Validate your asset
  }

  public async apply({ asset, transaction, stateStore }: ApplyAssetContext<ReverseLookupAssetProps>): Promise<void> {
		const node = getNodeForName(asset.name);
		const sender = await stateStore.account.get<LNSAccountProps>(transaction.senderAddress);

		const exists = sender.lns.ownNodes.find(n => n.equals(node));
		if (!exists) {
			throw new Error('You can only assign lookup node which you own.');
		}

		sender.lns.reverseLookup = node;
		await stateStore.account.set(sender.address, sender);
	}
}
