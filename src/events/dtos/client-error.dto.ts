import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

import { EventSeverity } from '../interfaces/event.interface';

export class ClientErrorDTO {
	@IsString()
	@IsNotEmpty()
	message: string;

	@IsString()
	@IsOptional()
	stack?: string;

	@IsString()
	@IsNotEmpty()
	url: string;

	@IsString()
	@IsOptional()
	componentName?: string;

	@IsString()
	@IsNotEmpty()
	userAgent: string;

	@IsObject()
	@IsOptional()
	metadata?: Record<string, any>;

	@IsString()
	@IsOptional()
	severity?: EventSeverity;

	@IsString()
	@IsOptional()
	correlationId?: string;

	@IsString()
	@IsOptional()
	userId?: string;
}
