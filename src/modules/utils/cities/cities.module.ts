import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModules } from '../../../databases/mongoose/database.module';

import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CitiesProviders } from './cities.provider';

@Module({
	imports: [
		PassportModule.register({
			defaultStrategy: 'AzureAD',
		}),
		MongooseModules,
	],
	controllers: [CitiesController],
	providers: [CitiesService, ...CitiesProviders],
})
export class CitiesModule {}
