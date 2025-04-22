import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO para crear un registro de auditoría
 */
export class CreateAuditDto {
	@ApiProperty({
		description: 'ID del usuario que realiza la acción',
		example: '507f1f77bcf86cd799439011',
	})
	@IsNotEmpty()
	@IsString()
	userId: string;

	@ApiProperty({
		description: 'Tipo de evento de auditoría',
		example: 'Gestión de llamado de capital',
	})
	@IsNotEmpty()
	@IsString()
	eventType: string;

	@ApiProperty({
		description: 'Acción realizada',
		example: 'crear',
	})
	@IsNotEmpty()
	@IsString()
	action: string;

	@ApiProperty({
		description: 'Tipo de recurso afectado',
		example: 'investment-call',
	})
	@IsNotEmpty()
	@IsString()
	resourceType: string;

	@ApiProperty({
		description: 'ID del recurso afectado',
		example: '507f1f77bcf86cd799439011',
	})
	@IsNotEmpty()
	@IsString()
	resourceId: string;

	@ApiProperty({
		description: 'Detalles adicionales del evento (se convertirá a string JSON)',
		example: {
			title: 'Llamado de inversión 2025',
			status: 'draft',
			investors: ['Investor1', 'Investor2'],
		},
	})
	@IsOptional()
	@IsObject()
	details: any;
}
