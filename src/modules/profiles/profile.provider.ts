import { Connection } from 'mongoose';

import { UserSchema } from './schemas/profile.schema';

export const ProfileProviders = [
	{
		provide: 'UserModelToken',
		useFactory: (connection: Connection) => connection.model('User', UserSchema),
		inject: ['DbConnectionToken'],
	},
];
