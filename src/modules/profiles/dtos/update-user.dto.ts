import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';

export class UpdateUserDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	readonly email: string;

	@ApiProperty({ required: true })
	@IsDefined()
	name: string;

	@ApiProperty({ required: true })
	@IsOptional()
	fatherName: string;

	@ApiProperty({ required: false })
	@IsOptional()
	motherName?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	phoneNumber?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	profileImage?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	cin?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	birthday?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	isActive: boolean;
}
