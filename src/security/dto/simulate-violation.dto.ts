import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIP, IsObject, IsOptional, IsString } from 'class-validator';

import { SecurityViolationType } from '@/core/interfaces/security/security.types';

export class SimulateViolationDto {
	@ApiProperty({
		description: 'Tipo de violación de seguridad a simular',
		enum: SecurityViolationType,
		example: SecurityViolationType.SUSPICIOUS_ACTIVITY,
		enumName: 'SecurityViolationType',
		required: true,
	})
	@IsEnum(SecurityViolationType, {
		message: 'El tipo de violación debe ser uno de los valores válidos',
	})
	violationType: SecurityViolationType;

	@ApiPropertyOptional({
		description: 'Dirección IP para la simulación (opcional, se usará la IP del cliente si no se proporciona)',
		example: '192.168.1.1',
		format: 'ipv4',
	})
	@IsOptional()
	@IsIP()
	ipAddress?: string;

	@ApiPropertyOptional({
		description: 'Descripción adicional de la violación',
		example: 'Simulación de actividad sospechosa para pruebas',
		maxLength: 500,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		description: 'Metadatos adicionales para la violación',
		example: {
			test: true,
			reason: 'Testing violation simulation',
			source: 'manual_test',
		},
		type: 'object',
	})
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>;
}
