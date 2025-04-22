import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateSecurityPinDto {
	@ApiProperty({
		description: 'PIN de seguridad para acceder al catálogo',
		example: '123456',
		minLength: 6,
		maxLength: 6,
	})
	@IsString({ message: 'El PIN debe ser una cadena de texto' })
	@Length(6, 6, { message: 'El PIN debe tener exactamente 6 dígitos' })
	pin: string;
}
