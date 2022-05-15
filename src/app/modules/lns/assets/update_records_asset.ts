import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { UpdateRecordsAssetProps, updateRecordsAssetPropsSchema } from '../data/asset/update_records';
import { LNSAccountProps } from '../data/account_props';
import {
	MAX_RECORDS,
	MAX_RECORD_LABEL_LENGTH,
	MAX_RECORD_VALUE_LENGTH,
	MIN_RECORD_LABEL_LENGTH,
	MIN_RECORD_VALUE_LENGTH,
	VALID_RECORD_TYPES,
} from '../constants';
import { getNodeForName, getLNSObject, updateLNSObject } from '../storage';
import { isTTLPassed } from '../utils';

export class UpdateRecordsAsset extends BaseAsset<UpdateRecordsAssetProps> {
	public name = 'updateRecords';
  public id = 3;

  // Define schema for asset
	public schema = updateRecordsAssetPropsSchema;

  public validate({ asset }: ValidateAssetContext<UpdateRecordsAssetProps>): void {
    // Check, if number of records to be updated is below the maximum allowed amount (here: MAX_RECORDS = 50)
		if (asset.records.length > MAX_RECORDS) {
			throw new Error(`You can associate maximum ${MAX_RECORDS} records. Got ${asset.records.length}.`);
		}

		const recordKeys = new Set(asset.records.map(r => `${r.type.toString()}:${r.label}`));

		// Checks if all records are unique
		if (recordKeys.size !== asset.records.length) {
			throw new Error('Records should be unique among type and label');
		}

		// Check each record
		for (const record of asset.records) {
			// Checks if all records have valid record types
			if (!VALID_RECORD_TYPES.includes(record.type)) {
				throw new Error(
					`Invalid record type "${
						record.type
					}". Valid record types are ${VALID_RECORD_TYPES.join()}`,
				);
			}

			// Checks, if record labels have a valid length
			if (
				record.label.length > MAX_RECORD_LABEL_LENGTH ||
				record.label.length < MIN_RECORD_LABEL_LENGTH
			) {
				throw new Error(
					`Record label can be between ${MIN_RECORD_LABEL_LENGTH}-${MAX_RECORD_LABEL_LENGTH}.`,
				);
			}

			// Checks, if record values have a valid length
			if (
				record.value.length > MAX_RECORD_VALUE_LENGTH ||
				record.value.length < MIN_RECORD_VALUE_LENGTH
			) {
				throw new Error(
					`Record value can be between ${MIN_RECORD_VALUE_LENGTH}-${MAX_RECORD_VALUE_LENGTH}.`,
				);
			}
		}
  }

	// eslint-disable-next-line @typescript-eslint/require-await
  public async apply({ asset, transaction, stateStore }: ApplyAssetContext<UpdateRecordsAssetProps>): Promise<void> {
		// Get the sender account from the database
		const sender = await stateStore.account.get<LNSAccountProps>(transaction.senderAddress);
		// Get the hash of the name
		const node = getNodeForName(asset.name);
		// Get the LNS object from the database
		const lnsObject = await getLNSObject(stateStore, node);

		// Validate, if the corresponding LNS object exists
		if (!lnsObject) {
			throw new Error(`LNS object with name "${asset.name}" is not registered`);
		}
		// Validate, that the sender registered the LNS object
		if (!lnsObject.ownerAddress.equals(sender.address)) {
			throw new Error('Only owner of hte LNS object can update records.');
		}
		// Validate, that the TTL for this LNS object to update the records has passed
		if (!isTTLPassed(lnsObject)) {
			throw new Error('You have to wait for TTL from the last update.');
		}

		// Update the LNS object with the new records from the asset
		await updateLNSObject(stateStore, { node, records: asset.records });
	}
}
