import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsIP, IsNotEmpty, IsObject, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Types } from 'mongoose';

export class DeviceInfoDto {
	@ApiProperty({
		description: 'Identificador único del dispositivo',
		example: 'device-123456',
	})
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@ApiProperty({
		description: 'Dirección IP del dispositivo',
		example: '192.168.1.1',
	})
	@IsIP()
	@IsNotEmpty()
	ipAddress: string;

	@ApiProperty({
		description: 'Navegador utilizado',
		example: 'Chrome 120.0.0',
	})
	@IsString()
	@IsNotEmpty()
	browser: string;

	@ApiProperty({
		description: 'Sistema operativo del dispositivo',
		example: 'Windows 11',
	})
	@IsString()
	@IsNotEmpty()
	operatingSystem: string;

	@ApiProperty({
		description: 'Indica si la solicitud proviene de una aplicación móvil',
		example: true,
		required: false,
	})
	@IsOptional()
	isApp?: boolean;

	@ApiProperty({
		description: 'Versión de la aplicación móvil',
		example: '1.2.3',
		required: false,
	})
	@IsString()
	@IsOptional()
	appVersion?: string;

	@ApiProperty({
		description: 'Modelo del dispositivo móvil',
		example: 'Samsung Galaxy S21',
		required: false,
	})
	@IsString()
	@IsOptional()
	deviceModel?: string;
}

export class SecurityPinWithDeviceDto {
	@ApiProperty({
		description: 'PIN de seguridad (6 dígitos)',
		example: '123456',
	})
	@IsString()
	@Length(6, 6, { message: 'El PIN debe tener exactamente 6 dígitos' })
	@Matches(/^\d{6}$/, { message: 'El PIN debe contener solo dígitos' })
	pin: string;

	// Este campo no se muestra en Swagger pero se usa internamente
	@IsObject()
	@IsOptional()
	deviceInfo?: DeviceInfoDto;

	// Este campo no se muestra en Swagger pero se usa internamente
	@IsString()
	@IsOptional()
	userId?: string;

	@ApiProperty({
		description: 'Fecha de expiración del PIN',
		example: '2025-05-11T00:00:00.000Z',
	})
	@Transform(({ value }) => (value ? new Date(value) : undefined))
	@IsDate()
	@IsOptional()
	expirationDate?: Date;
}

// DTO para Swagger que omite deviceInfo y userId
export class CreateSecurityPinDto extends OmitType(SecurityPinWithDeviceDto, ['deviceInfo', 'userId'] as const) {}

export class ValidatePinDto {
	@ApiProperty({
		description: 'PIN de seguridad (6 dígitos)',
		example: '123456',
	})
	@IsString()
	@Length(6, 6, { message: 'El PIN debe tener exactamente 6 dígitos' })
	@Matches(/^\d{6}$/, { message: 'El PIN debe contener solo dígitos' })
	pin: string;

	// Este campo no se muestra en Swagger pero se usa internamente
	@IsObject()
	@IsOptional()
	deviceInfo?: DeviceInfoDto;

	// Este campo no se muestra en Swagger pero se usa internamente
	@IsString()
	@IsOptional()
	userId?: string;
}

// DTO para Swagger que omite deviceInfo
export class ValidatePinSwaggerDto extends OmitType(ValidatePinDto, ['deviceInfo'] as const) {}

export interface SecurityPinData {
	pin: string;
	deviceInfo: DeviceInfoDto;
	userId: Types.ObjectId;
	expirationDate: Date;
	createdAt: Date;
}

export interface PinResponse {
	pin: string;
	expiresAt: string;
	createdAt: string;
}
