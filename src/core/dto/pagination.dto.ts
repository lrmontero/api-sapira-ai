import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO para manejar la paginación en las solicitudes
 */
export class PaginationDTO {
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
}

/**
 * DTO para respuestas paginadas
 */
export class PaginatedResponseDTO<T> {
	@ApiProperty({
		description: 'Datos paginados',
		isArray: true,
	})
	data: T[];

	@ApiProperty({
		description: 'Número total de elementos',
		type: Number,
	})
	items: number;

	@ApiProperty({
		description: 'Número total de páginas',
		type: Number,
	})
	pages: number;

	@ApiProperty({
		description: 'Página actual',
		type: Number,
	})
	currentPage: number;

	@ApiProperty({
		description: 'Elementos por página',
		type: Number,
	})
	limit: number;
}
