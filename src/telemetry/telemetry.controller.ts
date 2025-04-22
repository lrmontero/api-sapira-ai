import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { InsightsQueryService } from './insights-query.service';

@ApiTags('Telemetry')
@Controller('telemetry')
export class TelemetryController {
	constructor(private readonly insightsQuery: InsightsQueryService) {}

	@Get('business-operations')
	@ApiQuery({ name: 'timespan', required: false, type: String, description: 'Timespan (e.g., P1D, P7D)' })
	@ApiQuery({ name: 'workspace', required: false })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getBusinessOperations(@Query('timespan') timespan?: string, @Query('workspace') workspace?: string, @Query('limit') limit?: number) {
		return this.insightsQuery.getBusinessOperations({ timespan, workspace, limit });
	}

	@Get('audit-logs')
	@ApiQuery({ name: 'timespan', required: false, type: String })
	@ApiQuery({ name: 'workspace', required: false })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getAuditLogs(@Query('timespan') timespan?: string, @Query('workspace') workspace?: string, @Query('limit') limit?: number) {
		return this.insightsQuery.getAuditLogs({ timespan, workspace, limit });
	}

	@Get('endpoint-performance')
	@ApiQuery({ name: 'timespan', required: false, type: String })
	@ApiQuery({ name: 'workspace', required: false })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getEndpointPerformance(@Query('timespan') timespan?: string, @Query('workspace') workspace?: string, @Query('limit') limit?: number) {
		return this.insightsQuery.getEndpointPerformance({ timespan, workspace, limit });
	}

	@Get('system-health')
	@ApiQuery({ name: 'timespan', required: false, type: String })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getSystemHealth(@Query('timespan') timespan?: string, @Query('limit') limit?: number) {
		return this.insightsQuery.getSystemHealth({ timespan, limit });
	}
}
