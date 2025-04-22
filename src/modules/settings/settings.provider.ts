import { Connection } from 'mongoose';

import { SettingsSchema } from './schemas/settings.schema';

export const SettingsProviders = [
	{
		provide: 'SettingsModelToken',
		useFactory: (connection: Connection) => connection.model('Settings', SettingsSchema),
		inject: ['DbConnectionToken'],
	},
];
