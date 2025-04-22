import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EventEnricherService } from './services/event-enricher.service';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [EventEnricherService],
	exports: [EventEnricherService],
})
export class CoreModule {}
