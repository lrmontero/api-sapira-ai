import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

import { BaseEvent, EventSeverity, EventStatus, EventType, SecurityEvent } from '@/core/interfaces/events/event.interface';

@Injectable()
export class EventEnricherService {
	constructor(private readonly configService: ConfigService) {}

	enrichEvent<T extends BaseEvent>(event: Partial<T>): T {
		const baseEnrichment: Partial<BaseEvent> = {
			id: uuid(),
			timestamp: new Date(),
			correlationId: uuid(),
			severity: event.severity || EventSeverity.INFO,
			status: EventStatus.PENDING,
			source: this.configService.get('app.name', 'unknown'),
			metadata: {
				...event.metadata,
				environment: this.configService.get('app.environment', 'development'),
				version: this.configService.get('app.version', '1.0.0'),
			},
		};

		let enrichedEvent: BaseEvent;

		switch (event.type) {
			case EventType.SECURITY:
				enrichedEvent = this.enrichSecurityEvent({
					...baseEnrichment,
					...event,
				} as Partial<SecurityEvent>);
				break;
			case EventType.BUSINESS:
				enrichedEvent = this.enrichBusinessEvent({
					...baseEnrichment,
					...event,
				});
				break;
			case EventType.SYSTEM:
				enrichedEvent = this.enrichSystemEvent({
					...baseEnrichment,
					...event,
				});
				break;
			case EventType.AUDIT:
				enrichedEvent = this.enrichAuditEvent({
					...baseEnrichment,
					...event,
				});
				break;
			default:
				enrichedEvent = {
					...baseEnrichment,
					...event,
					type: EventType.SYSTEM,
				} as BaseEvent;
		}

		return enrichedEvent as unknown as T;
	}

	private enrichSecurityEvent(event: Partial<SecurityEvent>): SecurityEvent {
		const securityMetadata = {
			...event.metadata,
			securityLevel: this.calculateSecurityLevel((event as any).points || 0),
		};

		return {
			...event,
			type: EventType.SECURITY,
			severity: event.severity || EventSeverity.WARNING,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
			metadata: securityMetadata,
		} as SecurityEvent;
	}

	private enrichBusinessEvent(event: Partial<BaseEvent>): BaseEvent {
		return {
			...event,
			type: EventType.BUSINESS,
			severity: event.severity || EventSeverity.INFO,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
		} as BaseEvent;
	}

	private enrichSystemEvent(event: Partial<BaseEvent>): BaseEvent {
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
		} as BaseEvent;
	}

	private enrichAuditEvent(event: Partial<BaseEvent>): BaseEvent {
		return {
			...event,
			type: EventType.AUDIT,
			severity: event.severity || EventSeverity.INFO,
			timestamp: new Date(),
			correlationId: event.correlationId || uuid(),
		} as BaseEvent;
	}

	private calculateSecurityLevel(points: number): string {
		const thresholds = this.configService.get('events.security.pointThresholds', { high: 100, medium: 50 });
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
