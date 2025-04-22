import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ValidateImagesPipe implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const files = context.switchToHttp().getRequest().files;

		files.forEach((file) => {
			const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
			const maxSize = 10 * 1024 * 1024; // 10MB

			if (!allowedMimeTypes.includes(file.mimetype)) {
				throw new BadRequestException('Tipo de imagen inválido. Solo se permiten formatos png, jpeg y jpg.');
			}

			if (file.size > maxSize) {
				throw new BadRequestException('Uno de los archivos supera el máximo permitido. El tamaño máximo es de 10MB.');
			}
		});

		return next.handle();
	}
}

export class ValidateImagePipe implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const file = context.switchToHttp().getRequest().file;

		const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
		const maxSize = 10 * 1024 * 1024; // 10MB

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException('Tipo de imagen inválido. Solo se permiten formatos png, jpeg y jpg.');
		}

		if (file.size > maxSize) {
			throw new BadRequestException('Uno de los archivos supera el máximo permitido. El tamaño máximo es de 10MB.');
		}

		return next.handle();
	}
}
