import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseService } from '@/core/services/base/base.service';

import { RateLimitPolicy, SecurityPolicy } from '../interfaces/policy.interface';

@Injectable()
export class PolicyService extends BaseService {
	constructor(private readonly configService: ConfigService) {
		super();
	}

	getSecurityPolicy(): SecurityPolicy {
		return {
			enabled: this.configService.get('security.enabled', true),
			maxPoints: this.configService.get('security.maxPoints', 100),
			blockDuration: this.configService.get('security.blockDuration', 3600),
			pointsDecayRate: this.configService.get('security.pointsDecayRate', 1),
			whitelistedIps: this.configService.get('security.whitelistedIps', []),
			blacklistedIps: this.configService.get('security.blacklistedIps', []),
		};
	}

	getRateLimitPolicy(): RateLimitPolicy {
		return {
			enabled: this.configService.get('rateLimit.enabled', true),
			ttl: this.configService.get('rateLimit.ttl', 60),
			limit: this.configService.get('rateLimit.limit', 100),
			whitelistedRoutes: this.configService.get('rateLimit.whitelistedRoutes', []),
		};
	}
}
