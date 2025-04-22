import * as crypto from 'crypto';

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { CategoryFontConfigDto } from './dto/category-font-config.dto';
import { PinResponse, SecurityPinData, SecurityPinWithDeviceDto, ValidatePinDto } from './dto/security-pin-with-device.dto';
import { UpdateCategoryFontDto } from './dto/update-category-font.dto';
import { SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
	constructor(
		@Inject('SettingsModelToken')
		private readonly settingsModel: Model<SettingsDocument>
	) {
		this.initializeSecurityPin();
		this.initializeCategoryConfig();
		this.initializeDevicePins();
	}

	private async initializeSecurityPin(): Promise<void> {
		const pinExists = await this.settingsModel.exists({ key: 'CATALOG_SECURITY_PIN' });
		if (!pinExists) {
			// Crear pin inicial: 123456
			const hashedPin = this.hashPin('123456');
			await this.settingsModel.create({
				key: 'CATALOG_SECURITY_PIN',
				value: hashedPin,
				description: 'Pin de seguridad para acceder al catálogo de productos',
			});
		}
	}

	private async initializeCategoryConfig(): Promise<void> {
		const configExists = await this.settingsModel.exists({ key: 'CATEGORY_FONT_CONFIG' });
		if (!configExists) {
			const defaultConfig: CategoryFontConfigDto = {
				fontFamily: 'var(--font-montserrat)',
				fontSizes: {
					small: 14,
					large: 18,
				},
			};
			await this.settingsModel.create({
				key: 'CATEGORY_FONT_CONFIG',
				value: defaultConfig,
				description: 'Configuración de fuentes para las categorías',
			});
		}
	}

	private async initializeDevicePins(): Promise<void> {
		const pinsExist = await this.settingsModel.exists({ key: 'DEVICE_SECURITY_PINS' });
		if (!pinsExist) {
			await this.settingsModel.create({
				key: 'DEVICE_SECURITY_PINS',
				value: [],
				description: 'PINs de seguridad con información de dispositivos y fechas de expiración',
			});
		}
	}

	private hashPin(pin: string): string {
		return crypto.createHash('sha256').update(pin).digest('hex');
	}

	async validateSecurityPin(pin: string): Promise<boolean> {
		const result = await this.validateSecurityPinWithDevice({ pin, deviceInfo: null, userId: null });

		// const config = await this.settingsModel.findOne({ key: 'CATALOG_SECURITY_PIN' });
		// if (!config) {
		// 	throw new HttpException('Pin de seguridad no configurado', HttpStatus.INTERNAL_SERVER_ERROR);
		// }

		// const hashedPin = this.hashPin(pin);
		// return hashedPin === config.value;
		return result.isValid;
	}

	async updateSecurityPin(pin: string): Promise<{ message: string }> {
		if (!/^\d{6}$/.test(pin)) {
			throw new HttpException('El PIN debe tener exactamente 6 dígitos', HttpStatus.BAD_REQUEST);
		}

		try {
			const hashedPin = this.hashPin(pin);
			await this.settingsModel.findOneAndUpdate({ key: 'CATALOG_SECURITY_PIN' }, { value: hashedPin }, { upsert: true });

			return { message: 'PIN de seguridad actualizado correctamente' };
		} catch (error) {
			throw new HttpException('Error al actualizar el PIN de seguridad', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async getCategoryFontConfig(): Promise<CategoryFontConfigDto> {
		const config = await this.settingsModel.findOne({ key: 'CATEGORY_FONT_CONFIG' });
		if (!config) {
			throw new HttpException('Configuración de fuentes no encontrada', HttpStatus.NOT_FOUND);
		}
		return config.value as CategoryFontConfigDto;
	}

	async updateCategoryFontConfig(updateCategoryFontDto: UpdateCategoryFontDto): Promise<CategoryFontConfigDto> {
		try {
			const config = await this.settingsModel.findOneAndUpdate(
				{ key: 'CATEGORY_FONT_CONFIG' },
				{ $set: { value: updateCategoryFontDto } },
				{ new: true, upsert: true }
			);

			return config.value as CategoryFontConfigDto;
		} catch (error) {
			throw new HttpException('Error al actualizar la configuración de fuentes', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Crea un nuevo PIN de seguridad con información del dispositivo y fecha de expiración
	 * @param securityPinDto Datos del PIN y dispositivo
	 * @returns Objeto con información del PIN creado
	 */
	async createSecurityPinWithDevice(securityPinDto: SecurityPinWithDeviceDto): Promise<PinResponse> {
		if (!/^\d{6}$/.test(securityPinDto.pin)) {
			throw new HttpException('El PIN debe tener exactamente 6 dígitos', HttpStatus.BAD_REQUEST);
		}

		try {
			// Obtener el array actual de PINs
			const setting = await this.settingsModel.findOne({ key: 'DEVICE_SECURITY_PINS' });
			if (!setting) {
				throw new HttpException('Configuración de PINs no encontrada', HttpStatus.NOT_FOUND);
			}

			const pins = setting.value as SecurityPinData[];

			// Crear el nuevo PIN con fecha de expiración (por defecto 15 minutos si no se especifica)
			const hashedPin = this.hashPin(securityPinDto.pin);
			const expirationDate = securityPinDto.expirationDate || new Date(Date.now() + 15 * 60 * 1000);

			const newPinData: SecurityPinData = {
				pin: hashedPin,
				deviceInfo: securityPinDto.deviceInfo,
				userId: new Types.ObjectId(securityPinDto.userId),
				expirationDate,
				createdAt: new Date(),
			};

			// Agregar el nuevo PIN al array
			pins.push(newPinData);

			// Actualizar la configuración
			await this.settingsModel.updateOne({ key: 'DEVICE_SECURITY_PINS' }, { $set: { value: pins } });

			// Devolver la respuesta con el formato solicitado
			return {
				pin: securityPinDto.pin, // Devolvemos el PIN sin hash para que el cliente lo pueda mostrar
				expiresAt: expirationDate.toISOString(),
				createdAt: newPinData.createdAt.toISOString(),
			};
		} catch (error) {
			console.error('Error al crear PIN de seguridad:', error);
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException('Error al crear el PIN de seguridad', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Valida un PIN de seguridad con información del dispositivo
	 * @param validatePinDto PIN y datos del dispositivo a validar
	 * @returns Objeto con el resultado de la validación, mensaje si corresponde y userId del creador del PIN
	 */
	async validateSecurityPinWithDevice(validatePinDto: ValidatePinDto): Promise<{ isValid: boolean; message?: string; creatorUserId?: string }> {
		try {
			const hashedPin = this.hashPin(validatePinDto.pin);

			// Si no coincide con el PIN global, verificar PINs específicos de dispositivos
			const setting = await this.settingsModel.findOne({ key: 'DEVICE_SECURITY_PINS' });
			if (!setting) {
				throw new HttpException('Configuración de PINs no encontrada', HttpStatus.NOT_FOUND);
			}

			const pins = setting.value as SecurityPinData[];
			if (!pins || pins.length === 0) {
				return { isValid: false, message: 'No hay PINs de seguridad registrados' };
			}

			// Filtrar PINs expirados
			const now = new Date();
			const validPins = pins.filter((pin) => new Date(pin.expirationDate) > now);

			// Buscar cualquier PIN que coincida con el hash, sin verificar el dispositivo
			const allMatchingPins = pins.filter((pin) => pin.pin === hashedPin);

			// Buscar un PIN válido (no expirado) que coincida con el hash, sin verificar el dispositivo
			const validMatchingPin = validPins.find((pin) => pin.pin === hashedPin);

			// Si hay PINs expirados, limpiarlos
			if (validPins.length < pins.length) {
				// Limpiar todos los PINs expirados
				await this.cleanExpiredPins();
			}

			// Limpiar PINs que llevan más de un día expirados
			await this.cleanOldExpiredPins();

			// Si encontramos un PIN que coincide pero está expirado
			if (allMatchingPins.length > 0 && !validMatchingPin) {
				return {
					isValid: false,
					message: 'El PIN de seguridad ha expirado y será eliminado. Por favor, genere un nuevo PIN.',
				};
			}

			// Si encontramos un PIN válido, devolver también el userId del creador
			if (validMatchingPin) {
				const creatorUserId = validMatchingPin.userId ? validMatchingPin.userId.toString() : null;
				return { isValid: true, creatorUserId };
			}

			return { isValid: false };
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException('Error al validar el PIN de seguridad', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Elimina todos los PINs expirados de la base de datos
	 */
	private async cleanExpiredPins(): Promise<void> {
		try {
			// Obtener el array de PINs
			const setting = await this.settingsModel.findOne({ key: 'DEVICE_SECURITY_PINS' });
			if (!setting) {
				return;
			}

			const pins = setting.value as SecurityPinData[];
			if (!pins || pins.length === 0) {
				return;
			}

			// Filtrar PINs no expirados
			const now = new Date();
			const validPins = pins.filter((pin) => new Date(pin.expirationDate) > now);

			// Actualizar la configuración solo con los PINs válidos
			await this.settingsModel.updateOne({ key: 'DEVICE_SECURITY_PINS' }, { $set: { value: validPins } });
		} catch (error) {
			console.error('Error al limpiar PINs expirados:', error);
		}
	}

	/**
	 * Elimina los PINs que llevan más de un día expirados
	 * Este método es útil para mantener limpia la base de datos de PINs antiguos
	 */
	private async cleanOldExpiredPins(): Promise<void> {
		try {
			// Obtener el array de PINs
			const setting = await this.settingsModel.findOne({ key: 'DEVICE_SECURITY_PINS' });
			if (!setting) {
				return;
			}

			const pins = setting.value as SecurityPinData[];
			if (!pins || pins.length === 0) {
				return;
			}

			// Calcular la fecha de hace un día
			const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

			// Filtrar PINs que no están expirados o que expiraron hace menos de un día
			const pinsToKeep = pins.filter((pin) => {
				const expirationDate = new Date(pin.expirationDate);
				return expirationDate > new Date() || expirationDate > oneDayAgo;
			});

			// Si hay PINs para eliminar, actualizar la configuración
			if (pinsToKeep.length < pins.length) {
				console.log(`Eliminando ${pins.length - pinsToKeep.length} PINs expirados hace más de un día`);
				await this.settingsModel.updateOne({ key: 'DEVICE_SECURITY_PINS' }, { $set: { value: pinsToKeep } });
			}
		} catch (error) {
			console.error('Error al limpiar PINs antiguos expirados:', error);
		}
	}

	/**
	 * Obtiene todos los PINs de seguridad activos (no expirados)
	 * @returns Array de PINs de seguridad activos
	 */
	async getActiveSecurityPins(): Promise<SecurityPinData[]> {
		try {
			// Obtener el array de PINs
			const setting = await this.settingsModel.findOne({ key: 'DEVICE_SECURITY_PINS' });
			if (!setting) {
				return [];
			}

			const pins = setting.value as SecurityPinData[];
			if (!pins || pins.length === 0) {
				return [];
			}

			// Filtrar PINs no expirados
			const now = new Date();
			return pins.filter((pin) => new Date(pin.expirationDate) > now);
		} catch (error) {
			console.error('Error al obtener PINs de seguridad activos:', error);
			throw new HttpException('Error al obtener PINs de seguridad', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
