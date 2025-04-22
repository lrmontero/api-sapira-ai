import { Connection } from 'mongoose';

import { PromotionSchema } from './schemas/promotion.schema';

export const PromotionProvider = [
	{
		provide: 'PromotionModelToken',
		useFactory: (connection: Connection) => connection.model('Promotion', PromotionSchema),
		inject: ['DbConnectionToken'],
	},
];
