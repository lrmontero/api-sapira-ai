import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';

export class ContactDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	_id: string;

	@ApiProperty({ required: true })
	@IsDefined()
	email: string;

	@ApiProperty({ required: true })
	@IsDefined()
	name: string;

	@ApiProperty({ required: true })
	@IsDefined()
	fatherName: string;

	@ApiProperty({ required: false })
	@IsOptional()
	motherName?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	phoneNumber?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	company?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	jobTitle?: string;
}
