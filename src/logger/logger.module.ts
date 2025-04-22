import { Global, Module } from '@nestjs/common';

import { AppLoggerService } from './app-logger.service';
import { logProviders } from './providers/log.provider';

@Global()
@Module({
	providers: [...logProviders, AppLoggerService],
	exports: [AppLoggerService, 'LogModelToken'],
})
export class LoggerModule {}
