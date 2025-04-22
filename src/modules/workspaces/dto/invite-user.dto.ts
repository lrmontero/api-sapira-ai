import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class InviteUserDTO {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ required: true })
	workspaceId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ required: true })
	email: string;
}

export class InviteUserResponseDTO {
	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty({ required: true })
	success: boolean;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ required: true })
	message: string;
}
