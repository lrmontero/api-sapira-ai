import { Connection } from 'mongoose';

import { IpListSchema } from './schemas/ip-list.schema';

export const ipListProviders = [
	{
		provide: 'IpListModelToken',
		useFactory: (connection: Connection) => connection.model('IpList', IpListSchema),
		inject: ['DbConnectionToken'],
	},
];
