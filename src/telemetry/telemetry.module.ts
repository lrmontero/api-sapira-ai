import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';

import { BusinessMetricsService } from './business-metrics.service';
import { TelemetryService } from './telemetry.service';

@Module({
	imports: [LoggerModule],
	providers: [TelemetryService, BusinessMetricsService],
	exports: [TelemetryService, BusinessMetricsService],
})
export class TelemetryModule {}
