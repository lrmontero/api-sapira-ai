import { Injectable } from '@nestjs/common';

export interface AuditEndpointConfig {
	path: string | RegExp;
	methods?: string[];
	eventType?: string | ((method: string, path: string) => string);
	customDetails?: (data: any, request: any) => any;
}

@Injectable()
export class AuditConfigService {
	private endpointsToAudit: AuditEndpointConfig[] = [];

	// Configuración por defecto
	constructor() {
		// Por defecto, no auditamos ningún endpoint hasta que se configure explícitamente
	}

	addEndpointToAudit(config: AuditEndpointConfig): void {
		this.endpointsToAudit.push(config);
	}

	shouldAuditEndpoint(path: string, method: string): boolean {
		const shouldAudit = this.endpointsToAudit.some((config) => {
			const pathMatches = config.path instanceof RegExp ? config.path.test(path) : path.startsWith(config.path);
			const methodMatches = !config.methods || config.methods.includes(method);

			const matches = pathMatches && methodMatches;
			if (matches) {
				console.log(`[AuditConfig] Coincidencia encontrada para ${method} ${path}`);
			}

			return matches;
		});

		return shouldAudit;
	}

	getCustomDetailsExtractor(path: string): ((data: any, request: any) => any) | null {
		const config = this.endpointsToAudit.find((config) => {
			if (config.path instanceof RegExp) {
				return config.path.test(path);
			}
			return path.startsWith(config.path);
		});

		return config?.customDetails || null;
	}

	/**
	 * Obtiene el tipo de evento específico para un endpoint según su configuración
	 * @param path Ruta del endpoint
	 * @param method Método HTTP
	 * @returns Tipo de evento específico o null si no hay configuración
	 */
	getEventType(path: string, method: string): string | null {
		const config = this.endpointsToAudit.find((config) => {
			const pathMatches = config.path instanceof RegExp ? config.path.test(path) : path.startsWith(config.path);
			const methodMatches = !config.methods || config.methods.includes(method);
			return pathMatches && methodMatches;
		});

		if (!config || !config.eventType) {
			return null;
		}

		// Si eventType es una función, la ejecutamos pasando el método y la ruta
		if (typeof config.eventType === 'function') {
			return config.eventType(method, path);
		}

		// Si es un string, lo devolvemos directamente
		return config.eventType;
	}
}
