import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateImagePipeTransform implements PipeTransform {
	transform(file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('No se ha proporcionado ninguna imagen.');
		}

		// Validar que el archivo tenga un tamaño válido
		if (file.size === 0 || !file.buffer || file.buffer.length === 0) {
			console.error('Archivo con tamaño 0 o buffer vacío:', {
				size: file.size,
				bufferLength: file.buffer ? file.buffer.length : 'buffer no disponible',
				mimetype: file.mimetype,
				originalname: file.originalname,
			});
			throw new BadRequestException('El archivo de imagen está vacío o corrupto. Por favor, intenta con otra imagen.');
		}

		// NOTA: Los archivos SVG pueden contener código JavaScript malicioso.
		// Es recomendable implementar una sanitización de SVG antes de almacenarlos o mostrarlos.
		const allowedMimeTypes = [
			'image/png',
			'image/jpeg',
			'image/jpg',
			'image/gif',
			'image/webp',
			'image/svg+xml', // Permitir SVG, pero con precaución
		];
		const maxSize = 4 * 1024 * 1024; // 4MB

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException('Tipo de archivo inválido. Solo se permiten formatos de imagen: png, jpeg, jpg, gif y webp.');
		}

		if (file.size > maxSize) {
			throw new BadRequestException('La imagen supera el máximo permitido. El tamaño máximo es de 4MB.');
		}

		return file;
	}
}
