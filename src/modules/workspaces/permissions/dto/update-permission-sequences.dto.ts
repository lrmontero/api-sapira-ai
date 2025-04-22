import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

export class PermissionSequenceDTO {
	@ApiProperty({ description: 'ID del permiso', example: '60d21b4667d0d8992e610c85' })
	@IsMongoId()
	@IsNotEmpty()
	_id: string | Types.ObjectId;

	@ApiProperty({ description: 'Secuencia para ordenamiento', example: 1 })
	@IsNumber()
	@IsNotEmpty()
	sequence: number;
}

export class UpdatePermissionSequencesDto {
	@ApiProperty({
		description: 'Lista de permisos con su secuencia',
		type: [PermissionSequenceDTO],
		isArray: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => PermissionSequenceDTO)
	permissions: PermissionSequenceDTO[];
}
