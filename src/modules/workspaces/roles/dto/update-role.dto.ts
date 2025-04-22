import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDTO {
	@ApiProperty({ required: true })
	@IsString()
	name: string;

	@ApiProperty({ required: true })
	@IsString()
	code: string;

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({ required: false })
	@IsBoolean()
	@IsOptional()
	isDefault?: boolean;

	@ApiProperty({ required: false })
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@ApiProperty({ required: false, type: [String], description: 'Array de IDs de permisos' })
	@IsArray()
	@IsOptional()
	permissions?: string[];
}
