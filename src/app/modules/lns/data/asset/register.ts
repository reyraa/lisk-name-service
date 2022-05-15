export const registerAssetPropsSchema = {
  $id: 'lns/register-asset',
  title: 'RegisterAsset transaction asset for lns module',
  type: 'object',
  required: ['registerFor', 'name', 'ttl'],
  properties: {
    registerFor: {
      fieldNumber: 1,
      dataType: 'uint32',
    },
    name: {
      fieldNumber: 2,
      dataType: 'string',
    },
    ttl: {
      fieldNumber: 3,
      dataType: 'uint32',
    }
  },
};

export interface RegisterAssetProps {
	name: string;
	ttl: number;
	registerFor: number;
}
