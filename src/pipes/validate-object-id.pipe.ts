import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string> {
	transform(value: string) {
		// Si el valor es undefined o null, no intentamos validarlo
		if (value === undefined || value === null) {
			return value;
		}

		// Verificamos si es un ObjectId válido
		if (!Types.ObjectId.isValid(value)) {
			throw new BadRequestException('Id no válido');
		}

		return value;
	}
}
