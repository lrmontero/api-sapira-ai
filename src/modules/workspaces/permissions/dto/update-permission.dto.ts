import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDTO {
	@ApiProperty({ description: 'Nombre del permiso', example: 'Crear usuario' })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiProperty({ description: 'Código único del permiso', example: 'CREATE_USER' })
	@IsString()
	@IsOptional()
	code?: string;

	@ApiProperty({ description: 'Categoría del permiso', example: 'USUARIOS' })
	@IsString()
	@IsOptional()
	category?: string;

	@ApiProperty({ description: 'Proyecto al que pertenece el permiso', example: 'portal' })
	@IsString()
	@IsOptional()
	project?: string;

	@ApiProperty({ description: 'Secuencia para ordenamiento', example: 1 })
	@IsNumber()
	@IsOptional()
	sequence?: number;

	@ApiProperty({ description: 'Estado del permiso', example: true })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
