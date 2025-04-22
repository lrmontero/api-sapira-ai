import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { DeviceInfoInterceptor } from '@/interceptors/device-info.interceptor';
import { TokenInterceptor } from '@/interceptors/token.interceptor';

import { CategoryFontConfigDto } from './dto/category-font-config.dto';
import {
	CreateSecurityPinDto,
	DeviceInfoDto,
	PinResponse,
	SecurityPinData,
	SecurityPinWithDeviceDto,
	ValidatePinDto,
	ValidatePinSwaggerDto,
} from './dto/security-pin-with-device.dto';
import { UpdateCategoryFontDto } from './dto/update-category-font.dto';
import { UpdateSecurityPinDto } from './dto/update-security-pin.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor, DeviceInfoInterceptor)
@ApiBearerAuth()
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	@Get('category/font')
	@ApiOperation({
		summary: 'Obtener configuración de fuentes para categorías',
		description: 'Retorna la configuración actual de fuentes utilizada para mostrar las categorías en el catálogo.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Configuración de fuentes obtenida exitosamente',
		type: CategoryFontConfigDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No se encontró la configuración de fuentes',
	})
	getCategoryFontConfig(): Promise<CategoryFontConfigDto> {
		return this.settingsService.getCategoryFontConfig();
	}

	@Put('category/font')
	@ApiOperation({
		summary: 'Actualizar configuración de fuentes para categorías',
		description: 'Actualiza la configuración de fuentes para las categorías del catálogo.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Configuración de fuentes actualizada exitosamente',
		type: CategoryFontConfigDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Datos de configuración inválidos',
	})
	@HttpCode(HttpStatus.OK)
	async updateCategoryFontConfig(@Body() updateCategoryFontDto: UpdateCategoryFontDto): Promise<CategoryFontConfigDto> {
		const response = await this.settingsService.updateCategoryFontConfig(updateCategoryFontDto);
		return response;
	}

	@Post('security/validate-pin')
	@ApiOperation({
		summary: 'Validar pin de seguridad',
		description: 'Valida si el pin proporcionado coincide con el pin de seguridad almacenado.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Pin validado exitosamente',
		type: Boolean,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'El PIN debe tener exactamente 6 dígitos',
	})
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Pin de seguridad no configurado',
	})
	@HttpCode(HttpStatus.OK)
	async validateSecurityPin(@Body() { pin }: UpdateSecurityPinDto): Promise<boolean> {
		return this.settingsService.validateSecurityPin(pin);
	}

	@Put('security/pin')
	@ApiOperation({
		summary: 'Actualizar pin de seguridad',
		description: 'Actualiza el pin de seguridad utilizado para acceder al catálogo de productos.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Pin de seguridad actualizado exitosamente',
		type: Object,
		schema: {
			properties: {
				message: {
					type: 'string',
					description: 'Mensaje de confirmación',
					example: 'PIN de seguridad actualizado correctamente',
				},
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'El PIN debe tener exactamente 6 dígitos',
	})
	@HttpCode(HttpStatus.OK)
	async updateSecurityPin(@Body() { pin }: UpdateSecurityPinDto): Promise<{ message: string }> {
		const response = await this.settingsService.updateSecurityPin(pin);
		return response;
	}

	@Post('security/device-pin')
	@ApiOperation({
		summary: 'Crear PIN de seguridad con información del dispositivo',
		description:
			'Crea un nuevo PIN de seguridad asociado a un dispositivo específico con fecha de expiración. La información del dispositivo y el ID de usuario se capturan automáticamente.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'PIN de seguridad creado exitosamente',
		type: Object,
		schema: {
			properties: {
				pin: {
					type: 'string',
					description: 'PIN de seguridad creado',
					example: '123456',
				},
				expiresAt: {
					type: 'string',
					format: 'date-time',
					description: 'Fecha y hora de expiración del PIN',
					example: '2025-04-11T11:51:02.123Z',
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					description: 'Fecha y hora de creación del PIN',
					example: '2025-04-11T11:36:02.123Z',
				},
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Datos inválidos para la creación del PIN',
	})
	@HttpCode(HttpStatus.OK)
	async createSecurityPinWithDevice(@Body() securityPinDto: CreateSecurityPinDto, @Req() request: any): Promise<PinResponse> {
		// Obtener la información del dispositivo del request que fue agregada por el interceptor
		const deviceInfo: DeviceInfoDto = request.deviceInfo;

		// Obtener el ID del usuario del objeto user proporcionado por el guard de autenticación
		const userId = request.user?.extension_oid;

		if (!userId) {
			throw new Error('No se pudo obtener el ID del usuario autenticado');
		}

		// Combinar la información del DTO con la información del dispositivo y el ID del usuario
		const securityPinWithDevice: SecurityPinWithDeviceDto = {
			...securityPinDto,
			deviceInfo: deviceInfo,
			userId: userId,
		};

		return this.settingsService.createSecurityPinWithDevice(securityPinWithDevice);
	}

	@Post('security/validate-device-pin')
	@ApiOperation({
		summary: 'Validar PIN de seguridad con información del dispositivo',
		description:
			'Valida si el PIN proporcionado es válido para el dispositivo específico y no ha expirado. La información del dispositivo y el ID de usuario se capturan automáticamente.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Resultado de la validación del PIN',
		schema: {
			type: 'object',
			properties: {
				isValid: { type: 'boolean', description: 'Indica si el PIN es válido' },
				message: { type: 'string', description: 'Mensaje informativo (opcional)', nullable: true },
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Datos inválidos para la validación del PIN',
	})
	@HttpCode(HttpStatus.OK)
	async validateSecurityPinWithDevice(
		@Body() validatePinDto: ValidatePinSwaggerDto,
		@Req() request: any
	): Promise<{ isValid: boolean; message?: string }> {
		// Obtener la información del dispositivo del request que fue agregada por el interceptor
		const deviceInfo: DeviceInfoDto = request.deviceInfo;

		// Obtener el ID del usuario del objeto user proporcionado por el guard de autenticación
		const userId = request.user?.oid;

		if (!userId) {
			throw new Error('No se pudo obtener el ID del usuario autenticado');
		}

		// Combinar la información del DTO con la información del dispositivo y el ID del usuario
		const validatePinWithDevice: ValidatePinDto = {
			...validatePinDto,
			deviceInfo: deviceInfo,
			userId: userId,
		};

		return this.settingsService.validateSecurityPinWithDevice(validatePinWithDevice);
	}

	@Get('security/active-pins')
	@ApiOperation({
		summary: 'Obtener PINs de seguridad activos',
		description: 'Retorna todos los PINs de seguridad activos (no expirados) con su información de dispositivo.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Lista de PINs de seguridad activos',
		type: [Object],
	})
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Error al obtener los PINs de seguridad',
	})
	async getActiveSecurityPins(): Promise<SecurityPinData[]> {
		return this.settingsService.getActiveSecurityPins();
	}
}
