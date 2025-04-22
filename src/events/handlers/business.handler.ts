import { Injectable } from '@nestjs/common';

import { BaseEvent, BusinessEvent, EventType } from '@/core/interfaces/events/event.interface';
import { BusinessMetricsService } from '@/telemetry/business-metrics.service';

import { EventHandler } from '../interfaces/event-handler.interface';

@Injectable()
export class BusinessHandler implements EventHandler {
	constructor(private readonly metrics: BusinessMetricsService) {}

	canHandle(event: BaseEvent): boolean {
		return event.type === EventType.BUSINESS;
	}

	async handle(event: BaseEvent): Promise<void> {
		const businessEvent = event as BusinessEvent;
		this.metrics.trackBusinessOperation(businessEvent.action, {
			userId: businessEvent.userId || 'anonymous',
			success: true,
			operationType: businessEvent.action as 'create' | 'update' | 'delete' | 'read' | 'process',
			resourceType: businessEvent.entityType,
			details: {
				entityId: businessEvent.entityId,
				eventType: businessEvent.type,
				category: businessEvent.category,
				value: businessEvent.value,
			},
		});
	}
}
