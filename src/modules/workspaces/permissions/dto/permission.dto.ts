import { ApiProperty } from '@nestjs/swagger';

export class PermissionDTO {
	@ApiProperty({ required: true })
	name: string;

	@ApiProperty({ required: true })
	code: string;

	@ApiProperty({ required: true })
	category: string;

	@ApiProperty({ required: true })
	project: string;

	@ApiProperty({ required: true })
	sequence: number;

	@ApiProperty({ default: true })
	isActive: boolean;

	@ApiProperty({ required: true })
	createdBy: string;

	@ApiProperty({ required: true })
	updatedBy: string;
}
