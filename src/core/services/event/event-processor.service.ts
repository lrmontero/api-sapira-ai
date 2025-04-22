import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseEvent } from '@/core/interfaces/events/event.interface';
import { BaseService } from '@/core/services/base/base.service';

import { EventEnricherService } from './event-enricher.service';

@Injectable()
export class EventProcessorService extends BaseService {
	constructor(
		private readonly eventEnricher: EventEnricherService,
		private readonly configService: ConfigService
	) {
		super();
	}

	async processEvent<T extends BaseEvent>(event: Partial<T>): Promise<T> {
		try {
			// Enriquecer el evento con información adicional
			const enrichedEvent = this.eventEnricher.enrichEvent(event);

			// Aquí podrías agregar más lógica de procesamiento
			// como validación, transformación, etc.

			return enrichedEvent;
		} catch (error) {
			this.logger.error(`Error processing event: ${error.message}`, error.stack);
			throw error;
		}
	}

	async batchProcessEvents<T extends BaseEvent>(events: Partial<T>[]): Promise<T[]> {
		try {
			return await Promise.all(events.map((event) => this.processEvent(event)));
		} catch (error) {
			this.logger.error(`Error batch processing events: ${error.message}`, error.stack);
			throw error;
		}
	}
}
