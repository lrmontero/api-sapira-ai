import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class IdUserDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	readonly _id: string;
}
