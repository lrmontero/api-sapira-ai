import { Injectable } from '@nestjs/common';

import { BaseEvent } from '@/core/interfaces/events/event.interface';
import { AppLoggerService } from '@/logger/app-logger.service';

import { EventHandler } from '../interfaces/event-handler.interface';

@Injectable()
export class EventDispatcherService {
	private handlers: EventHandler[] = [];

	constructor(private readonly logger: AppLoggerService) {}

	registerHandler(handler: EventHandler) {
		this.handlers.push(handler);
	}

	async dispatch(event: BaseEvent): Promise<void> {
		const handlers = this.handlers.filter((handler) => handler.canHandle(event));

		if (handlers.length === 0) {
			this.logger.warn(`No handlers found for event type: ${event.type}`);
			return;
		}

		await Promise.all(
			handlers.map(async (handler) => {
				try {
					await handler.handle(event);
				} catch (error) {
					this.logger.logErrorWithMetadata(error, {
						metadata: {
							context: 'EventDispatcherService.dispatch',
							eventType: event.type,
							handlerName: handler.constructor.name,
						},
					});
				}
			})
		);
	}
}
