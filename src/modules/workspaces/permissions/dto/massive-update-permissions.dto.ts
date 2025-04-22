import { ApiProperty } from '@nestjs/swagger';

export class MassiveUpdatePermissionsDTO {
	@ApiProperty({ required: true })
	_id: string;

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

	@ApiProperty({ required: false })
	createdBy?: string;

	@ApiProperty({ required: false })
	updatedBy?: string;
}
