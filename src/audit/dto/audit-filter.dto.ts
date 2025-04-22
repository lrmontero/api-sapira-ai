import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO para filtrar registros de auditoría
 */
export class AuditFilterDTO {
	@ApiProperty({
		description: 'Número de página (comienza en 1)',
		type: Number,
		default: 1,
		required: false,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	@Type(() => Number)
	page?: number = 1;

	@ApiProperty({
		description: 'Número de elementos por página',
		type: Number,
		default: 10,
		required: false,
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	@Type(() => Number)
	limit?: number = 10;

	@ApiProperty({
		description: 'Término de búsqueda para filtrar resultados',
		type: String,
		required: false,
	})
	@IsOptional()
	@IsString()
	search?: string;
	@ApiProperty({
		description: 'ID del usuario',
		required: false,
		example: '60d5ec9af682fbd12a0f4a82',
	})
	@IsOptional()
	@IsString()
	userId?: string;

	@ApiProperty({
		description: 'Tipo de evento de auditoría',
		required: false,
		example: 'document.create',
	})
	@IsOptional()
	@IsString()
	eventType?: string;

	@ApiProperty({
		description: 'Fecha de inicio para filtrar (YYYY-MM-DD)',
		required: false,
		example: '2025-01-01',
	})
	@IsOptional()
	@IsDateString({}, { message: 'La fecha de inicio debe tener un formato válido (YYYY-MM-DD)' })
	startDate?: string;

	@ApiProperty({
		description: 'Fecha de fin para filtrar (YYYY-MM-DD)',
		required: false,
		example: '2025-12-31',
	})
	@IsOptional()
	@IsDateString({}, { message: 'La fecha de fin debe tener un formato válido (YYYY-MM-DD)' })
	endDate?: string;
}
