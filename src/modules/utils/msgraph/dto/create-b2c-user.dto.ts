import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateB2CUserDTO {
	@ApiProperty({
		description: 'Nombre del usuario',
		example: 'Juan',
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({
		description: 'Apellido paterno del usuario',
		example: 'Pérez',
	})
	@IsNotEmpty()
	@IsString()
	fatherName: string;

	@ApiProperty({
		description: 'Apellido materno del usuario',
		example: 'González',
	})
	@IsOptional()
	@IsString()
	motherName?: string;

	@ApiProperty({
		description: 'Correo electrónico del usuario',
		example: 'usuario@ejemplo.com',
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'Contraseña del usuario (mínimo 8 caracteres)',
		example: 'Contraseña123!',
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password: string;
}

export class CreateB2CUserResponseDTO {
	success: boolean;
	message: string;
	userId?: string;
	error?: any;
}
