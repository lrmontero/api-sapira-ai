import { Connection } from 'mongoose';

import { DeviceSchema } from './schemas/device.schema';

export const DevicesProviders = [
	{
		provide: 'DeviceModelToken',
		useFactory: (connection: Connection) => connection.model('Device', DeviceSchema),
		inject: ['DbConnectionToken'],
	},
];
