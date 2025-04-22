import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserTeamDTO {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	role?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	license?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	suscriptionDate?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	ownerStatus?: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
