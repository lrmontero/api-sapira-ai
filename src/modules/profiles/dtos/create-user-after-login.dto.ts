import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';

export class CreateUserAfterLoginDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	readonly email: string;

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
	oid?: string;
}
