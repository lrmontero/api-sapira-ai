import { Connection } from 'mongoose';

import { AuditSchema } from './schemas/audit.schema';

export const AuditProviders = [
	{
		provide: 'AuditModelToken',
		useFactory: (connection: Connection) => connection.model('Audit', AuditSchema),
		inject: ['DbConnectionToken'],
	},
];
