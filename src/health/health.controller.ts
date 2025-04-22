import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus/';

import { Public } from '@/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
	constructor(private readonly health: HealthCheckService) {}

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([]);
	}
}
