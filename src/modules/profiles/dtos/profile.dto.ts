import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';

export class ProfileDTO {
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
	image?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	profileImage?: string;

	@ApiProperty({ required: true })
	@IsDefined()
	isActive: boolean;

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
