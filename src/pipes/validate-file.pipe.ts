import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, PipeTransform } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ValidateFilesPipe implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const files = context.switchToHttp().getRequest().files;

		files.forEach((file) => {
			const allowedMimeTypes = [
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'application/vnd.ms-excel',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'application/vnd.ms-powerpoint',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'text/plain',
				'image/png',
				'image/jpeg',
				'image/jpg',
			];
			const maxSize = 20 * 1024 * 1024; // 20MB

			if (!allowedMimeTypes.includes(file.mimetype)) {
				throw new BadRequestException(
					'Tipo de archivo inválido. Solo se permiten formatos pdf, doc, docx, xls, xlsx, ppt, pptx, txt, png, jpeg y jpg.'
				);
			}

			if (file.size > maxSize) {
				throw new BadRequestException('Uno de los archivos supera el máximo permitido. El tamaño máximo es de 20MB.');
			}
		});

		return next.handle();
	}
}

@Injectable()
export class ValidateFilePipe implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const file = context.switchToHttp().getRequest().file;

		if (!file) {
			throw new BadRequestException('No se ha proporcionado ningún archivo.');
		}

		const allowedMimeTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'text/plain',
			'image/png',
			'image/jpeg',
			'image/jpg',
		];
		const maxSize = 20 * 1024 * 1024; // 20MB

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException(
				'Tipo de archivo inválido. Solo se permiten formatos pdf, doc, docx, xls, xlsx, ppt, pptx, txt, png, jpeg y jpg.'
			);
		}

		if (file.size > maxSize) {
			throw new BadRequestException('El archivo supera el máximo permitido. El tamaño máximo es de 20MB.');
		}

		return next.handle();
	}
}

@Injectable()
export class ValidateFilePipeTransform implements PipeTransform {
	transform(file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('No se ha proporcionado ningún archivo.');
		}

		const allowedMimeTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'text/plain',
			'image/png',
			'image/jpeg',
			'image/jpg',
		];
		const maxSize = 20 * 1024 * 1024; // 20MB

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException(
				'Tipo de archivo inválido. Solo se permiten formatos pdf, doc, docx, xls, xlsx, ppt, pptx, txt, png, jpeg y jpg.'
			);
		}

		if (file.size > maxSize) {
			throw new BadRequestException('El archivo supera el máximo permitido. El tamaño máximo es de 20MB.');
		}

		return file;
	}
}
