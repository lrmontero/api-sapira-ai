export interface SecurityPolicy {
	enabled: boolean;
	maxPoints: number;
	blockDuration: number;
	pointsDecayRate: number;
	whitelistedIps?: string[];
	blacklistedIps?: string[];
}

export interface RateLimitPolicy {
	enabled: boolean;
	ttl: number;
	limit: number;
	whitelistedRoutes?: string[];
}
