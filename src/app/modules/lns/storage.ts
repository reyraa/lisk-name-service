import { hash } from 'eth-ens-namehash';
import { chain, codec, StateStore } from 'lisk-sdk';
import { LNS_PREFIX } from './constants';
import { LNSNode, lnsNodeSchema } from './data/ls_nodes';

// Get a unique key for each LNS object
export const getKeyForNode = (node: Buffer): string => `${LNS_PREFIX}:${node.toString('hex')}`;

// Create a hash from the domain name and return it as Buffer
export const getNodeForName = (name: string): Buffer =>
	Buffer.from(hash(name).slice(2), 'hex');

export const getLNSObject = async (
  stateStore: StateStore,
  node: Buffer,
): Promise<LNSNode | undefined> => {
  const result = await stateStore.chain.get(getKeyForNode(node));

  if (!result) {
    return;
  }

  // eslint-disable-next-line consistent-return
  return codec.decode<LNSNode>(lnsNodeSchema, result);
};

export const createLNSObject = async (
	stateStore: StateStore,
	params: Omit<LNSNode, 'createdAt' | 'updatedAt' | 'node'> & { name: string },
): Promise<void> => {
	const { name, ...lnsObject } = params;
	const node = getNodeForName(name);

	const input: LNSNode = {
		...lnsObject,
		name,
		createdAt: Math.ceil(Date.now() / 1000),
		updatedAt: Math.ceil(Date.now() / 1000),
	};

	await stateStore.chain.set(getKeyForNode(node), codec.encode(lnsNodeSchema, input));
};

export const updateLNSObject = async (
	stateStore: StateStore,
	params: Partial<Omit<LNSNode, 'createdAt' | 'updatedAt'>> & { node: Buffer },
): Promise<void> => {
	const lnsObject = await getLNSObject(stateStore, params.node);

	if (!lnsObject) {
		throw new Error('No lns object is associated with this name');
	}

	lnsObject.ttl = params.ttl ?? lnsObject.ttl;
	lnsObject.ownerAddress = params.ownerAddress ?? lnsObject.ownerAddress;
	lnsObject.expiry = params.expiry ?? lnsObject.expiry;
	lnsObject.records = params.records ?? lnsObject.records;

	lnsObject.updatedAt = Math.ceil(Date.now() / 1000);

	await stateStore.chain.set(getKeyForNode(params.node), codec.encode(lnsNodeSchema, lnsObject));
};
