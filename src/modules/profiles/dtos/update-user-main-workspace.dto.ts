import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional } from 'class-validator';
import { ContactDTO } from './contact.dto';

export class UpdateUserMainWorkspaceDTO {
	@ApiProperty({ required: true })
	@IsDefined()
	mainWorkspace: string;
}
