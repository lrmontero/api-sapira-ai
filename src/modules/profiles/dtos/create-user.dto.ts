import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';

export class CreateUserDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	readonly email: string;

	@ApiProperty({ required: true })
	@IsDefined()
	name: string;

	@ApiProperty({ required: false })
	@IsOptional()
	code?: string;

	@ApiProperty({ required: true })
	@IsDefined()
	fatherName: string;

	@ApiProperty({ required: false })
	@IsOptional()
	motherName?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	oid?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	isActive: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	phoneNumber?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	image?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	profileImage?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	settings?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	firebaseToken?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	imageSignature?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	locale?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	timezone?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	validateEmail?: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	validationCode?: number;
}
