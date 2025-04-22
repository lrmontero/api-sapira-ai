import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import { v4 as uuid } from 'uuid';

interface UserInfo {
	userId: string;
	email?: string;
	name?: string;
	roles?: string[];
}

export interface DeviceInfo {
	userAgent?: string;
	ip?: string;
	deviceId?: string;
	platform?: string;
	browser?: string;
}

export class UserUtils {
	/**
	 * Extrae la información del usuario de la petición
	 * @param req Request de Express
	 * @returns Información del usuario
	 */
	static extractUserInfo(req: Request): UserInfo {
		const userData = (req as any).userData;
		return {
			userId: userData?.extension_oid || 'anonymous',
			email: userData?.emails?.[0] || userData?.email,
			name: userData?.given_name,
			roles: userData?.roles || [],
		};
	}

	/**
	 * Extrae la información del dispositivo de la petición
	 * @param req Request de Express
	 * @returns Información del dispositivo
	 */
	static extractDeviceInfo(req: Request): DeviceInfo {
		return {
			userAgent: req.headers['user-agent'],
			ip: req.ip || req.socket.remoteAddress,
			deviceId: (req.headers['x-device-id'] as string) || uuid(),
			platform: this.getPlatformFromUserAgent(req.headers['user-agent']),
			browser: this.getBrowserFromUserAgent(req.headers['user-agent']),
		};
	}

	/**
	 * Normaliza el ID de usuario
	 * @param user Usuario a normalizar
	 * @returns ID de usuario normalizado
	 */
	static normalizeUserId(user: any): string {
		if (!user) return 'anonymous';
		return user.id || user.sub || user.userId || 'anonymous';
	}

	/**
	 * Valida si un ID de usuario es válido
	 * @param userId ID de usuario a validar
	 * @returns true si el ID es válido, false en caso contrario
	 */
	static isValidUserId(userId: string): boolean {
		return userId && userId !== 'anonymous' && userId.length > 0;
	}

	private static getPlatformFromUserAgent(userAgent?: string): string {
		if (!userAgent) return 'unknown';
		const parser = new UAParser(userAgent);
		const os = parser.getOS();
		return os.name || 'unknown';
	}

	private static getBrowserFromUserAgent(userAgent?: string): string {
		if (!userAgent) return 'unknown';
		const parser = new UAParser(userAgent);
		const browser = parser.getBrowser();
		return browser.name || 'unknown';
	}
}
