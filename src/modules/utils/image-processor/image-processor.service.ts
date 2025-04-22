import { Injectable } from '@nestjs/common';
import sharp, { type ResizeOptions, type Sharp, type WebpOptions } from 'sharp';

@Injectable()
export class ImageProcessorService {
	private readonly webpOptions: WebpOptions = {
		quality: 80, // Buena calidad pero con compresión
		lossless: false,
	};

	private readonly maxWidth = 1920; // Ancho máximo para imágenes normales
	private readonly maxPromotedWidth = 2560; // Ancho máximo para imágenes promocionales

	async processImage(buffer: Buffer, isPromoted = false): Promise<Buffer> {
		const image: Sharp = sharp(buffer);
		const metadata = await image.metadata();

		// Determinar el ancho máximo basado en si es una imagen promocional
		const maxWidth = isPromoted ? this.maxPromotedWidth : this.maxWidth;

		// Redimensionar solo si la imagen es más ancha que el máximo permitido
		// y mantener la relación de aspecto
		if (metadata.width && metadata.width > maxWidth) {
			image.resize(maxWidth, null, <ResizeOptions>{
				fit: 'inside',
				withoutEnlargement: true,
			});
		}

		// Convertir a WebP con las opciones especificadas
		return image.webp(this.webpOptions).toBuffer();
	}
}
