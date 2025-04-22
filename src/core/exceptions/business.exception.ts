import { HttpException, HttpStatus } from '@nestjs/common';

export interface BusinessExceptionResponse {
	message: string;
	code: string;
	details?: Record<string, any>;
}

export class BusinessException extends HttpException {
	constructor(response: BusinessExceptionResponse, status: HttpStatus = HttpStatus.BAD_REQUEST) {
		super(response, status);
	}
}

export class DuplicateEntityException extends BusinessException {
	constructor(entity: string, field: string, value: string) {
		super({
			message: `Ya existe un/a ${entity} con ${field}: "${value}"`,
			code: `DUPLICATE_${entity.toUpperCase()}_${field.toUpperCase()}`,
			details: {
				entity,
				field,
				value,
			},
		});
	}
}

export class EntityNotFoundException extends BusinessException {
	constructor(entity: string, field: string, value: string) {
		super(
			{
				message: `No se encontró ${entity} con ${field}: "${value}"`,
				code: `${entity.toUpperCase()}_NOT_FOUND`,
				details: {
					entity,
					field,
					value,
				},
			},
			HttpStatus.NOT_FOUND
		);
	}
}
