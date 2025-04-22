import { BaseEvent } from '@/core/interfaces/events/event.interface';

export interface EventHandler {
	canHandle(event: BaseEvent): boolean;
	handle(event: BaseEvent): Promise<void>;
}
