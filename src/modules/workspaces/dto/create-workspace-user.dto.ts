import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceUserDTO {
	@ApiProperty({
		description: 'Nombre del usuario',
		example: 'Juan',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: 'Código del usuario',
		example: '202020',
	})
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiProperty({
		description: 'Apellido paterno del usuario',
		example: 'Pérez',
	})
	@IsString()
	@IsNotEmpty()
	fatherName: string;

	@ApiProperty({
		description: 'Apellido materno del usuario (opcional)',
		example: 'Gómez',
		required: false,
	})
	@IsString()
	@IsOptional()
	motherName?: string;

	@ApiProperty({
		description: 'Correo electrónico del usuario',
		example: 'juan.perez@ejemplo.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description:
			'Contraseña del usuario (mínimo 8 caracteres, debe incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial)',
		example: 'Contraseña123!',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(64)
	@Matches(/^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[@$!%*?&#.,;:_\-])[A-Za-záéíóúüñÁÉÍÓÚÜÑ\d@$!%*?&#.,;:_\-]+$/, {
		message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
	})
	password: string;

	@ApiProperty({
		description: 'Rol del usuario en el workspace',
		example: '62d5bdbf9e98226c45433833',
		required: false,
	})
	@IsString()
	@IsOptional()
	roleId?: string;
}

export class CreateWorkspaceUserResponseDTO {
	@ApiProperty({
		description: 'Indica si la operación fue exitosa',
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: 'Mensaje descriptivo del resultado de la operación',
		example: 'Usuario creado correctamente en el workspace',
	})
	message: string;

	@ApiProperty({
		description: 'ID del usuario en Azure B2C',
		example: '00000000-0000-0000-0000-000000000000',
		required: false,
	})
	userId?: string;

	@ApiProperty({
		description: 'ID del usuario en la base de datos',
		example: '62d5bdbf9e98226c45433833',
		required: false,
	})
	profileId?: string;

	@ApiProperty({
		description: 'Objeto con información del error en caso de fallo',
		required: false,
	})
	error?: any;
}
