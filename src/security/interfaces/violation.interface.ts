import { BaseEntity } from '@/core/interfaces/base/base.interface';

export enum ViolationType {
	RATE_LIMIT = 'RATE_LIMIT',
	INVALID_TOKEN = 'INVALID_TOKEN',
	SUSPICIOUS_BEHAVIOR = 'SUSPICIOUS_BEHAVIOR',
	BLOCKED_IP = 'BLOCKED_IP',
}

export interface SecurityViolation extends BaseEntity {
	ip: string;
	type: ViolationType;
	points: number;
	details?: Record<string, any>;
	timestamp: Date;
}
