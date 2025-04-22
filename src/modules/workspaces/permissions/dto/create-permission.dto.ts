import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDTO {
	@ApiProperty({ description: 'Nombre del permiso', example: 'Crear usuario' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ description: 'Código único del permiso', example: 'CREATE_USER' })
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiProperty({ description: 'Categoría del permiso', example: 'USUARIOS' })
	@IsString()
	@IsNotEmpty()
	category: string;

	@ApiProperty({ description: 'Proyecto al que pertenece el permiso', example: 'portal' })
	@IsString()
	@IsNotEmpty()
	project: string;

	@ApiProperty({ description: 'Secuencia para ordenamiento', example: 1 })
	@IsNumber()
	@IsNotEmpty()
	sequence: number;

	@ApiProperty({ description: 'Estado del permiso', default: true, required: false })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
