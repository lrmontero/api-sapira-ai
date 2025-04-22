import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';

export class IsAuthDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	isAuth: boolean;
}
