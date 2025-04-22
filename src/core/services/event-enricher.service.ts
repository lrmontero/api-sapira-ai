import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

import { AuditEvent, BaseEvent, BusinessEvent, EventSeverity, EventType, SecurityEvent, SystemEvent } from '../interfaces/events/event.interface';

@Injectable()
export class EventEnricherService {
	constructor(private readonly configService: ConfigService) {}

	enrichEvent<T extends BaseEvent>(event: Partial<T>): T {
		const baseEnrichment: Partial<BaseEvent> = {
			timestamp: new Date(),
			correlationId: uuid(),
			severity: event.severity || EventSeverity.INFO,
			metadata: {
				environment: this.configService.get('NODE_ENV'),
				version: this.configService.get('APP_VERSION'),
				...event.metadata,
			},
		};

		if (!event.type) {
			const enrichedEvent: BaseEvent = {
				...baseEnrichment,
				...event,
				type: EventType.SYSTEM,
				severity: EventSeverity.INFO,
			} as BaseEvent;
			return enrichedEvent as unknown as T;
		}

		const enrichedEvent = (() => {
			switch (event.type) {
				case EventType.SECURITY:
					return this.enrichSecurityEvent({ ...baseEnrichment, ...event } as Partial<SecurityEvent>);
				case EventType.BUSINESS:
					return this.enrichBusinessEvent({ ...baseEnrichment, ...event } as Partial<BusinessEvent>);
				case EventType.SYSTEM:
					return this.enrichSystemEvent({ ...baseEnrichment, ...event } as Partial<SystemEvent>);
				case EventType.AUDIT:
					return this.enrichAuditEvent({ ...baseEnrichment, ...event } as Partial<AuditEvent>);
				default: {
					const defaultEvent: BaseEvent = {
						...baseEnrichment,
						...event,
						type: EventType.SYSTEM,
						severity: EventSeverity.INFO,
					} as BaseEvent;
					return defaultEvent;
				}
			}
		})();

		return enrichedEvent as unknown as T;
	}

	private enrichSecurityEvent(event: Partial<SecurityEvent>): SecurityEvent {
		return {
			...event,
			type: EventType.SECURITY,
			severity: event.severity || EventSeverity.WARNING,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
			metadata: {
				...event.metadata,
				securityLevel: this.calculateSecurityLevel(event.points || 0),
			},
		} as SecurityEvent;
	}

	private enrichBusinessEvent(event: Partial<BusinessEvent>): BusinessEvent {
		return {
			...event,
			type: EventType.BUSINESS,
			severity: event.severity || EventSeverity.INFO,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
		} as BusinessEvent;
	}

	private enrichSystemEvent(event: Partial<SystemEvent>): SystemEvent {
		return {
			...event,
			type: EventType.SYSTEM,
			severity: event.severity || EventSeverity.INFO,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
			metadata: {
				...event.metadata,
				systemInfo: this.getSystemInfo(),
			},
		} as SystemEvent;
	}

	private enrichAuditEvent(event: Partial<AuditEvent>): AuditEvent {
		return {
			...event,
			type: EventType.AUDIT,
			severity: event.severity || EventSeverity.INFO,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
		} as AuditEvent;
	}

	private calculateSecurityLevel(points: number): string {
		const thresholds = this.configService.get('events.security.pointThresholds');
		if (points >= thresholds.high) return 'high';
		if (points >= thresholds.medium) return 'medium';
		return 'low';
	}

	private getSystemInfo() {
		return {
			nodeVersion: process.version,
			platform: process.platform,
			memory: process.memoryUsage(),
		};
	}
}
