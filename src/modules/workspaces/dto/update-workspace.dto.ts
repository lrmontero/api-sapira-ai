import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateWorkspaceDTO {
	@ApiProperty({ description: 'Nombre del workspace', required: false })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiProperty({ description: 'Logo del workspace', required: false })
	@IsString()
	@IsOptional()
	logo?: string;

	@ApiProperty({ description: 'Email de contacto del workspace', required: false })
	@IsEmail()
	@IsOptional()
	contactEmail?: string;

	@ApiProperty({ description: 'Estado activo del workspace', required: false })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@ApiProperty({ description: 'Color del botón', required: false })
	@IsString()
	@IsOptional()
	buttonColor?: string;

	@ApiProperty({ description: 'Color del texto del botón', required: false })
	@IsString()
	@IsOptional()
	buttonTextColor?: string;

	@ApiProperty({ description: 'CIN de la cuenta', required: false })
	@IsString()
	@IsOptional()
	accountCin?: string;

	@ApiProperty({ description: 'Email de la cuenta', required: false })
	@IsEmail()
	@IsOptional()
	accountEmail?: string;
}
