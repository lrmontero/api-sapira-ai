import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { BaseEvent, EventType, SecurityEvent } from '@/core/interfaces/events/event.interface';
import { ViolationType } from '@/security/interfaces/violation.interface';
import { ViolationService } from '@/security/services/violation.service';

import { EventHandler } from '../interfaces/event-handler.interface';

@Injectable()
export class SecurityHandler implements EventHandler {
	constructor(private readonly violationService: ViolationService) {}

	canHandle(event: BaseEvent): boolean {
		return event.type === EventType.SECURITY;
	}

	async handle(event: BaseEvent): Promise<void> {
		const securityEvent = event as SecurityEvent;
		const now = new Date();

		await this.violationService.recordViolation({
			id: uuid(),
			type: ViolationType.SUSPICIOUS_BEHAVIOR,
			ip: securityEvent.ipAddress || 'unknown',
			points: securityEvent.points,
			details: {
				violationType: securityEvent.violationType,
				...securityEvent.metadata,
			},
			createdAt: now,
			updatedAt: now,
		});
	}
}
