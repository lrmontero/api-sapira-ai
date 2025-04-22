import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as UAParser from 'ua-parser-js';
import { IBrowser, IOS } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interfaz para la información del dispositivo
 */
interface DeviceInfo {
	// Campos requeridos
	deviceId: string;
	ipAddress: string;
	browser: string;
	operatingSystem: string;

	// Campos opcionales
	isApp?: boolean;
	appVersion?: string;
	deviceModel?: string;
	userAgent?: string;
	browserVersion?: string;
	isMobile?: boolean;
	hardware?: any;
	connection?: any;
	language?: string;
	languages?: string[];
	platform?: string;
	timeZone?: string;
	colorScheme?: string;
	donotTrack?: boolean;
	online?: boolean;
	cookiesEnabled?: boolean;
	dateTime?: string;
	screenSize?: string;

	// Permitir campos adicionales
	[key: string]: any;
}

@Injectable()
export class DeviceInfoInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const ip = this.getClientIp(request);

		// 1. Obtener información del dispositivo desde el frontend si está disponible
		let frontendInfo: DeviceInfo | null = null;
		const frontendDeviceInfo = request.headers['x-device-info'] as string;

		if (frontendDeviceInfo) {
			try {
				// Decodificar el string base64 a UTF-8
				const decodedInfo = Buffer.from(frontendDeviceInfo, 'base64').toString('utf-8');

				// Parsear el JSON decodificado
				frontendInfo = JSON.parse(decodedInfo);
			} catch (e) {
				throw new Error('Error al decodificar/parsear x-device-info');
			}
		}

		// 2. Obtener el user-agent y determinar si es una aplicación móvil
		const userAgent = frontendInfo?.userAgent || request.headers['user-agent'] || '';
		const isOkHttp = userAgent ? userAgent.toLowerCase().includes('okhttp') : false;
		const isApp = frontendInfo?.isMobile !== undefined ? frontendInfo.isMobile : isOkHttp || !!request.headers['x-app-version'];
		const appVersion = (request.headers['x-app-version'] as string) || '';

		// 3. Determinar información del navegador y sistema operativo
		// Si la información viene del frontend, la usamos directamente
		let browserName = frontendInfo?.browser || 'Desconocido';
		let browserVersion = frontendInfo?.browserVersion || '';
		let operatingSystem = frontendInfo?.operatingSystem || 'Desconocido';
		let deviceModel = frontendInfo?.deviceModel || '';

		// 4. Si no tenemos información del frontend, intentamos extraerla del user-agent
		if (!frontendInfo && userAgent) {
			try {
				const parser = new UAParser.UAParser(userAgent);
				const parsedBrowser: IBrowser = parser.getBrowser();
				const parsedOS: IOS = parser.getOS();
				const parsedDevice = parser.getDevice();

				// Asignar valores solo si no tenemos información del frontend
				if (!browserName || browserName === 'Desconocido') browserName = parsedBrowser.name || 'Desconocido';
				if (!browserVersion) browserVersion = parsedBrowser.version || '';
				if (!operatingSystem || operatingSystem === 'Desconocido') {
					operatingSystem = `${parsedOS.name || 'Desconocido'} ${parsedOS.version || ''}`.trim();
				}
				if (!deviceModel && parsedDevice.model) deviceModel = parsedDevice.model;
			} catch (error) {
				// En caso de error, mantener los valores por defecto
			}
		}

		// 5. Gestionar el ID del dispositivo
		let deviceId = request.headers['x-device-id'] || request.cookies?.device_id;
		const isNewDevice = !deviceId;

		if (isNewDevice) {
			// Si es un dispositivo nuevo, generamos un ID
			deviceId = `device-${uuidv4()}`;

			// Para navegadores web: establecer cookie
			if (!isApp) {
				response.cookie('device_id', deviceId, {
					maxAge: 365 * 24 * 60 * 60 * 1000 * 2, // 2 años
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
				});
			}

			// Para todas las solicitudes: incluir el ID en el encabezado de respuesta
			response.header('x-device-id', deviceId);
		}

		// 6. Crear objeto DeviceInfo completo
		// Asegurar que tenga los campos requeridos
		const deviceInfo: DeviceInfo = {
			deviceId,
			ipAddress: ip,
			browser: isApp ? 'App Móvil' : `${browserName} ${browserVersion}`.trim(),
			operatingSystem,
			isApp,
			appVersion: appVersion || undefined,
			deviceModel: deviceModel || undefined,
		};

		// 7. Si tenemos información del frontend, la usamos directamente
		if (frontendInfo) {
			// Copiar todos los campos del frontendInfo al deviceInfo
			Object.entries(frontendInfo).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					// No sobreescribir campos críticos
					if (!['deviceId', 'ipAddress'].includes(key)) {
						deviceInfo[key] = value;
					}
				}
			});
		}

		// Adjuntar la información del dispositivo a la solicitud
		request.deviceInfo = deviceInfo;

		return next.handle();
	}

	private getClientIp(request: any): string {
		// Obtener la IP real considerando proxies
		return (
			request.headers['x-forwarded-for']?.split(',')[0].trim() ||
			request.connection?.remoteAddress ||
			request.socket?.remoteAddress ||
			request.ip ||
			'0.0.0.0'
		);
	}
}
