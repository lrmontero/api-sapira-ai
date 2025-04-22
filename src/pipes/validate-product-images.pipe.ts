import { BadRequestException, Inject, Injectable, PipeTransform, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

interface ProductImages {
	imageFile?: Express.Multer.File[];
	promotedImageFile?: Express.Multer.File[];
}

@Injectable({ scope: Scope.REQUEST })
export class ValidateProductImagesPipe implements PipeTransform {
	private readonly allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/jpg']);
	private readonly allowedExtensions = new Set(['.png', '.jpg', '.jpeg']);
	private readonly maxSize = 10 * 1024 * 1024; // 10MB

	constructor(@Inject(REQUEST) private readonly request: Request) {}

	transform(value: ProductImages) {
		if (!value || !Object.keys(value).length) {
			return value;
		}

		// Validar imagen principal
		if (value.imageFile?.[0]) {
			this.validateImage(value.imageFile[0], 'principal');
		} else if (this.request.method === 'POST' && !this.request.body.imageUrl) {
			// En POST requerimos o imageFile o imageUrl
			throw new BadRequestException({
				message: 'Se requiere una imagen principal (imageFile o imageUrl)',
				code: 'VALIDATION_ERROR',
				field: 'imageFile',
			});
		}

		// Validar imagen promocional (opcional)
		if (value.promotedImageFile?.[0]) {
			this.validateImage(value.promotedImageFile[0], 'promocional');
		}

		return value;
	}

	private validateImage(file: Express.Multer.File, type: string) {
		// Validar que el archivo no esté vacío
		if (file.size === 0 || !file.buffer || file.buffer.length === 0) {
			throw new BadRequestException({
				message: `La imagen ${type} está vacía o tiene un tamaño de 0 bytes`,
				code: 'VALIDATION_ERROR',
				field: type === 'principal' ? 'imageFile' : 'promotedImageFile',
			});
		}

		// Validar el tipo MIME
		if (!this.allowedMimeTypes.has(file.mimetype)) {
			throw new BadRequestException({
				message: `La imagen ${type} debe ser de tipo PNG, JPEG o JPG`,
				code: 'VALIDATION_ERROR',
				field: type === 'principal' ? 'imageFile' : 'promotedImageFile',
			});
		}

		// Validar la extensión del archivo
		const fileExtension = this.getFileExtension(file.originalname).toLowerCase();
		if (!this.allowedExtensions.has(fileExtension)) {
			throw new BadRequestException({
				message: `La imagen ${type} debe tener una extensión .png, .jpg o .jpeg`,
				code: 'VALIDATION_ERROR',
				field: type === 'principal' ? 'imageFile' : 'promotedImageFile',
			});
		}

		if (file.size > this.maxSize) {
			throw new BadRequestException({
				message: `La imagen ${type} supera el tamaño máximo permitido de 10MB`,
				code: 'VALIDATION_ERROR',
				field: type === 'principal' ? 'imageFile' : 'promotedImageFile',
			});
		}
	}

	private getFileExtension(filename: string): string {
		const lastDotIndex = filename.lastIndexOf('.');
		return lastDotIndex < 0 ? '' : filename.slice(lastDotIndex);
	}
}
