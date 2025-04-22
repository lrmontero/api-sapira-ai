import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModules } from '../../databases/mongoose/database.module';

import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PromotionProvider } from './promotion.provider';

@Module({
	imports: [
		PassportModule.register({
			defaultStrategy: 'AzureAD',
		}),
		MongooseModules,
	],
	controllers: [PromotionController],
	providers: [PromotionService, ...PromotionProvider],
})
export class PromotionModule {}
