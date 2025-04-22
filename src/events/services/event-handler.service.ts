import { Injectable, OnModuleInit } from '@nestjs/common';

import { BaseEvent } from '@/core/interfaces/events/event.interface';

import { BusinessHandler } from '../handlers/business.handler';
import { SecurityHandler } from '../handlers/security.handler';

import { EventDispatcherService } from './event-dispatcher.service';

@Injectable()
export class EventHandlerService implements OnModuleInit {
	constructor(
		private readonly dispatcher: EventDispatcherService,
		private readonly securityHandler: SecurityHandler,
		private readonly businessHandler: BusinessHandler
	) {}

	onModuleInit() {
		// Registrar los manejadores de eventos
		this.dispatcher.registerHandler(this.securityHandler);
		this.dispatcher.registerHandler(this.businessHandler);
	}

	async handleEvent(event: BaseEvent): Promise<void> {
		await this.dispatcher.dispatch(event);
	}
}
