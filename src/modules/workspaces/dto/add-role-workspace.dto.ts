import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddRoleWorkspaceDTO {
	@IsString()
	@ApiProperty({ required: true })
	role: string;
}
