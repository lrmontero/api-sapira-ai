import { BadRequestException } from '@nestjs/common';
import * as ipaddr from 'ipaddr.js';

import { SecurityViolationType } from '@/core/interfaces/security/security.types';

interface IpValidationOptions {
	throwOnInvalid?: boolean;
	allowXForwardedFor?: boolean;
	checkSpecialRanges?: boolean;
}

interface IpValidationResult {
	ip: string;
	isLocal: boolean;
	isRailway: boolean;
}

interface PointsValidationOptions {
	min?: number;
	max?: number;
	throwOnInvalid?: boolean;
}

interface RiskLevelThresholds {
	low: number;
	medium: number;
	high: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export class SecurityUtils {
	private static readonly RISK_LEVEL_THRESHOLDS: RiskLevelThresholds = {
		low: 30,
		medium: 70,
		high: 100,
	};

	private static readonly VIOLATION_TYPE_POINTS: Record<SecurityViolationType, number> = {
		[SecurityViolationType.IP_BLACKLISTED]: 100,
		[SecurityViolationType.RATE_LIMIT_EXCEEDED]: 15,
		[SecurityViolationType.POINTS_THRESHOLD_EXCEEDED]: 50,
		[SecurityViolationType.INVALID_TOKEN]: 10,
		[SecurityViolationType.EXPIRED_TOKEN]: 5,
		[SecurityViolationType.UNAUTHORIZED_ACCESS]: 35,
		[SecurityViolationType.SUSPICIOUS_ACTIVITY]: 25,
		[SecurityViolationType.BRUTE_FORCE_ATTEMPT]: 40,
		[SecurityViolationType.MALFORMED_REQUEST]: 20,
		[SecurityViolationType.INVALID_CREDENTIALS]: 30,
		[SecurityViolationType.INVALID_MSAL_TOKEN]: 10,
		[SecurityViolationType.INVALID_B2C_TOKEN]: 10,
		[SecurityViolationType.SESSION_HIJACKING]: 45,
		[SecurityViolationType.MULTIPLE_FAILED_LOGIN]: 30,
	};

	private static readonly RAILWAY_IP_RANGES = ['172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16'];

	/**
	 * Valida y normaliza una dirección IP, incluyendo verificaciones especiales
	 * @param ip Dirección IP a validar
	 * @param options Opciones de validación
	 * @returns Resultado de la validación con la IP normalizada y flags
	 */
	static validateAndNormalizeIp(ip: string, options: IpValidationOptions = {}): IpValidationResult {
		try {
			const parsedIp = ipaddr.parse(ip);
			const normalizedIp = parsedIp.toString();

			const result: IpValidationResult = {
				ip: normalizedIp,
				isLocal: false,
				isRailway: false,
			};

			if (options.checkSpecialRanges) {
				// Verificar si es una IP local
				result.isLocal = parsedIp.range() === 'private' || parsedIp.range() === 'loopback' || normalizedIp === '::1';

				// Verificar si es una IP de Railway
				result.isRailway = this.RAILWAY_IP_RANGES.some((range) => {
					try {
						const [rangeIp, bits] = range.split('/');
						const rangeAddr = ipaddr.parse(rangeIp);
						const maskLength = parseInt(bits);

						// Asegurarnos de que ambas IPs son del mismo tipo (IPv4 o IPv6)
						if (parsedIp.kind() === rangeAddr.kind()) {
							return (parsedIp as any).match(rangeAddr, maskLength);
						}
						return false;
					} catch (error) {
						return false;
					}
				});
			}

			return result;
		} catch (error) {
			if (options.throwOnInvalid) {
				throw new BadRequestException(`Invalid IP address: ${ip}`);
			}
			return {
				ip,
				isLocal: false,
				isRailway: false,
			};
		}
	}

	/**
	 * Valida si un tipo de violación es válido
	 * @param type Tipo de violación a validar
	 * @returns true si el tipo es válido, false en caso contrario
	 */
	static isValidViolationType(type: string): type is SecurityViolationType {
		return Object.values(SecurityViolationType).includes(type as SecurityViolationType);
	}

	/**
	 * Obtiene los puntos asociados a un tipo de violación
	 * @param type Tipo de violación
	 * @returns Puntos asociados al tipo de violación
	 */
	static getViolationPoints(type: SecurityViolationType): number {
		return this.VIOLATION_TYPE_POINTS[type] || 0;
	}

	/**
	 * Determina el nivel de riesgo basado en los puntos
	 * @param points Puntos a evaluar
	 * @returns Nivel de riesgo (low, medium, high)
	 */
	static getRiskLevel(points: number): RiskLevel {
		if (points >= this.RISK_LEVEL_THRESHOLDS.high) {
			return 'high';
		} else if (points >= this.RISK_LEVEL_THRESHOLDS.medium) {
			return 'medium';
		}
		return 'low';
	}

	/**
	 * Valida y normaliza puntos
	 * @param points Puntos a validar
	 * @param options Opciones de validación
	 * @returns Puntos normalizados
	 */
	static validatePoints(points: number, options: PointsValidationOptions = {}): { normalizedPoints: number } {
		const { min = 0, max = 100, throwOnInvalid = false } = options;

		if (points < min || points > max) {
			if (throwOnInvalid) {
				throw new BadRequestException(`Points must be between ${min} and ${max}`);
			}
			return { normalizedPoints: Math.max(min, Math.min(max, points)) };
		}

		return { normalizedPoints: points };
	}
}
