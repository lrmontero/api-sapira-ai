import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsString, IsArray, IsBoolean, IsMongoId, IsDate, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class RoleDTO {
	@ApiProperty({ required: true })
	name: string;

	@ApiProperty({ required: true })
	code: string;

	@ApiProperty({ required: true })
	description: string;

	@ApiProperty({ required: true })
	premissions: Types.ObjectId[];

	@ApiProperty({ required: true })
	isDefault: boolean;

	@ApiProperty({ required: true })
	isActive: boolean;

	@ApiProperty({ required: true })
	createdBy: string;

	@ApiProperty({ required: true })
	updatedBy: string;
}
