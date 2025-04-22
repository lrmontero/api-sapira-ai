import { forwardRef, Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { CoreModule } from '@/core/core.module';
import { AppLoggerService } from '@/logger/app-logger.service';

import { EventsModule } from '../events/events.module';

import { ipListProviders } from './ip-list.provider';
import { SecurityController } from './security.controller';
import { JwtService } from './services/jwt.service';
import { SecurityService } from './services/security.service';
import { ViolationService } from './services/violation.service';

@Global()
@Module({
	imports: [forwardRef(() => EventsModule), CoreModule],
	providers: [
		...ipListProviders,
		SecurityService,
		ViolationService,
		AppLoggerService,
		JwtService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	controllers: [SecurityController],
	exports: [SecurityService, ViolationService, 'IpListModelToken', JwtService],
})
export class SecurityModule {}
