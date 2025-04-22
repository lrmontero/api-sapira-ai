import { Module } from '@nestjs/common';

import { MongooseModules } from '@/databases/mongoose/database.module';

import { DevicesController } from './devices.controller';
import { DevicesProviders } from './devices.provider';
import { DevicesService } from './devices.service';

@Module({
	imports: [MongooseModules],
	controllers: [DevicesController],
	providers: [DevicesService, ...DevicesProviders],
	exports: [DevicesService],
})
export class DevicesModule {}
