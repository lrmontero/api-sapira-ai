import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { License } from '../licenses/schemas/license.schema';
import { Team } from '../teams/schemas/team.schema';

export class CreateWorkspaceDTO {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ required: true })
	name: string;

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	logo?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	contactEmail?: string;

	@IsBoolean()
	@IsOptional()
	@ApiProperty({ required: false })
	isActive?: boolean;

	@IsArray()
	@IsOptional()
	@ApiProperty({ required: false })
	licenses?: License[];

	@IsArray()
	@IsOptional()
	@ApiProperty({ required: false })
	teamMembers?: Team[];

	@IsArray()
	@IsOptional()
	@ApiProperty({ required: false })
	roles?: object[];
}
