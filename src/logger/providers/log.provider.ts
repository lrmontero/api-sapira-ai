import { Connection } from 'mongoose';

import { LogSchema } from '../schemas/log.schema';

export const logProviders = [
	{
		provide: 'LogModelToken',
		useFactory: (connection: Connection) => connection.model('Log', LogSchema),
		inject: ['DbConnectionToken'],
	},
];
