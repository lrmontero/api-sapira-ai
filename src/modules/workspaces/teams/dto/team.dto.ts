import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { licenseDTO } from '../../licenses/dto/licenses.dto';
import { RoleDTO } from '../../roles/dto/role.dto';

export class TeamDTO {
	@ApiProperty({ required: true })
	user: Types.ObjectId;

	@ApiProperty({ required: true })
	role: RoleDTO | Types.ObjectId;

	@ApiProperty({ required: true })
	license: licenseDTO | Types.ObjectId;

	@ApiProperty({ required: true })
	ownerStatus: boolean;

	@ApiProperty({ required: true })
	isActive: boolean;

	@ApiProperty({ required: true })
	createdBy: string;

	@ApiProperty({ required: true })
	updatedBy: string;
}
