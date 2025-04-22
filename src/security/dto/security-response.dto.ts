import { BaseResponse } from '@/core/interfaces/base/base.interface';

import { RateLimitPolicy, SecurityPolicy } from '../interfaces/policy.interface';

export class SecurityPolicyResponse implements BaseResponse<SecurityPolicy> {
	success: boolean;
	data?: SecurityPolicy;
	error?: {
		code: string;
		message: string;
	};
}

export class RateLimitPolicyResponse implements BaseResponse<RateLimitPolicy> {
	success: boolean;
	data?: RateLimitPolicy;
	error?: {
		code: string;
		message: string;
	};
}
