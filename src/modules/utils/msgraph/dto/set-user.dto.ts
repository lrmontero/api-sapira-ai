import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';

export class setGraphUserDTO {
	// Basic Info
	@ApiProperty({ required: true })
	@IsDefined()
	displayName: string;

	@ApiProperty({ required: true })
	@IsDefined()
	givenName: string;

	@ApiProperty({ required: true })
	@IsOptional()
	surname?: string;

	@ApiProperty({ required: true })
	@IsOptional()
	extension_SegundoApellido?: string;

	@ApiProperty({ required: true })
	@IsOptional()
	extension_oid?: string;
}
