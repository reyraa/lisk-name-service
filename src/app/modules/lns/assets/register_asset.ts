import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { RegisterAssetProps, registerAssetPropsSchema } from '../data/asset/register';
import { createLNSObject, getLNSObject, getNodeForName } from '../storage';
import { LNSAccountProps } from '../data/account_props';
import { MIN_TTL_VALUE, VALID_TLDS } from '../constants';
import { addYears } from '../utils';

export class RegisterAsset extends BaseAsset<RegisterAssetProps> {
	public name = 'register';
  public id = 0;

  // Define schema for asset
	public schema = registerAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<RegisterAssetProps>): void {
    if (asset.ttl < MIN_TTL_VALUE) {
			throw new Error('The TTL (Time-to-live), value needs to be above the minimum defined TTL value (60 * 60).');
		}

		if (asset.registerFor < 1 || asset.registerFor > 5) {
			throw new Error('The registerFor value needs to be between 1 and 5 years.');
		}

		const numberOfDots = asset.name.match(/\./g);
		if (!numberOfDots || numberOfDots.length > 1) {
			throw new Error('Only second level domain names can be registered. e.g. example.lsk');
		}

		if (!VALID_TLDS.includes(numberOfDots[1])) {
			throw new Error('Only domains with valid TLDs (Top-Level Domain), can be registered.');
		}
  }

	// eslint-disable-next-line @typescript-eslint/require-await
  public async apply({ asset, transaction, stateStore }: ApplyAssetContext<RegisterAssetProps>): Promise<void> {
		// Get namehash output of the domain name
		const node = getNodeForName(asset.name);

		// Check if this domain is already registered on the blockchain
		const existingDomain = await getLNSObject(stateStore, node);
		if (existingDomain) {
			throw new Error(`The name "${asset.name}" already registered`);
		}

		// Create the LNS object and save it on the blockchain
		const lnsObject = {
			name: asset.name,
			ttl: asset.ttl,
			expiry: Math.ceil(addYears(new Date(), asset.registerFor).getTime() / 1000),
			ownerAddress: transaction.senderAddress,
			records: [],
		};
		await createLNSObject(stateStore, lnsObject);

		// Get the sender account
		const sender = await stateStore.account.get<LNSAccountProps>(transaction.senderAddress);

		// Add the namehash output of the domain to the sender account
		sender.lns.ownNodes = [...sender.lns.ownNodes, node];

		// Save the updated sender account on the blockchain
		await stateStore.account.set(sender.address, sender);
	}
}
