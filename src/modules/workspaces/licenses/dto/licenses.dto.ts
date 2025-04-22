import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsMongoId, IsNumber, IsString } from 'class-validator';

export class licenseDTO {
	@ApiProperty({ required: false })
	name: string;

	@ApiProperty({ required: false })
	quantity: number;

	@ApiProperty({ required: false })
	orderNumber: number;

	@ApiProperty({ required: false })
	available: number;

	@ApiProperty({ required: false })
	frequency: number;

	@ApiProperty({ required: false })
	expiryDate: string;

	@ApiProperty({ required: false })
	isActive: boolean;

	@ApiProperty({ required: false })
	createdBy: string;

	@ApiProperty({ required: false })
	updatedBy: string;
}

export class licenseCreateDTO {
	@IsString()
	@ApiProperty({ required: true })
	name: string;

	@IsNumber()
	@ApiProperty({ required: true })
	quantity: number;

	@IsNumber()
	@ApiProperty({ required: true })
	orderNumber: number;

	@IsNumber()
	@ApiProperty({ required: true })
	available: number;

	@IsNumber()
	@ApiProperty({ required: true })
	frequency: number;

	@IsDate()
	@ApiProperty({ type: Date, required: true })
	expiryDate: string;

	@IsMongoId()
	@ApiProperty({ required: true })
	createdBy: string;
}

export class licenseBodyDTO {
	@IsMongoId()
	@ApiProperty({ required: true })
	_id: string;

	@IsString()
	@ApiProperty({ required: true })
	name: string;

	@IsNumber()
	@ApiProperty({ required: true })
	quantity: number;

	@IsNumber()
	@ApiProperty({ required: true })
	orderNumber: number;

	@IsNumber()
	@ApiProperty({ required: true })
	available: number;

	@IsNumber()
	@ApiProperty({ required: true })
	frequency: number;

	@IsDate()
	@ApiProperty({ type: Date, required: true })
	expiryDate: string;

	@IsBoolean()
	@ApiProperty({ required: true })
	isActive: boolean;

	@IsMongoId()
	@ApiProperty({ required: true })
	createdBy: string;

	@IsMongoId()
	@ApiProperty({ required: true })
	updatedBy: string;

	@IsDate()
	@ApiProperty({ type: Date, required: true })
	createdAt: string;

	@IsDate()
	@ApiProperty({ type: Date, required: true })
	updatedAt: string;
}

export class licenseUpdateDTO extends PartialType(OmitType(licenseBodyDTO, ['_id', 'name', 'createdAt', 'createdBy', 'updatedAt'])) {}

export class licenseResponseDTO {
	@IsArray()
	@ApiProperty({ required: false, type: [licenseBodyDTO] })
	data: licenseBodyDTO[];

	@IsString()
	@ApiProperty({ required: false })
	message: string;

	@IsBoolean()
	@ApiProperty({ required: true })
	status: true;
}
