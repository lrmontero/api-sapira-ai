import { Injectable } from '@nestjs/common';

import { SecurityViolationType } from '@/core/interfaces/security/security.types';
import { BaseService } from '@/core/services/base/base.service';
import { AppLoggerService } from '@/logger/app-logger.service';

import { SecurityViolation, ViolationType } from '../interfaces/violation.interface';

@Injectable()
export class ViolationService extends BaseService {
	private violationTypeMap: Record<ViolationType, SecurityViolationType> = {
		[ViolationType.RATE_LIMIT]: SecurityViolationType.RATE_LIMIT_EXCEEDED,
		[ViolationType.INVALID_TOKEN]: SecurityViolationType.INVALID_TOKEN,
		[ViolationType.SUSPICIOUS_BEHAVIOR]: SecurityViolationType.SUSPICIOUS_ACTIVITY,
		[ViolationType.BLOCKED_IP]: SecurityViolationType.IP_BLACKLISTED,
	};

	constructor(protected readonly appLogger: AppLoggerService) {
		super();
	}

	async recordViolation(violation: Omit<SecurityViolation, 'timestamp'>): Promise<void> {
		try {
			const securityViolationType = this.violationTypeMap[violation.type];

			await this.appLogger.logSecurityEvent(securityViolationType, {
				metadata: {
					ip: violation.ip,
					points: violation.points,
					details: violation.details,
				},
			});
		} catch (error) {
			this.appLogger.error('Error recording security violation', error);
		}
	}

	async checkViolationThreshold(): Promise<boolean> {
		// Implementar lógica para verificar si una IP ha excedido el umbral de violaciones
		return false;
	}
}
