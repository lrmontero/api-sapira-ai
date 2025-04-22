import { Injectable, Logger } from '@nestjs/common';
import * as appInsights from 'applicationinsights';

export interface BusinessOperationData {
	workspace?: string;
	success: boolean;
	userId: string;
	details?: any;
	duration?: number;
	operationType?: 'create' | 'update' | 'delete' | 'read' | 'process';
	resourceType?: string;
	errorDetails?: any;
}

@Injectable()
export class BusinessMetricsService {
	private client: appInsights.TelemetryClient;

	private readonly logger = new Logger(BusinessMetricsService.name);

	constructor() {
		try {
			this.client = appInsights.defaultClient;
			if (!this.client) {
				this.logger.warn('Application Insights no está inicializado');
			}
		} catch (error) {
			this.logger.warn(`Error al obtener el cliente de Application Insights: ${error.message}`);
			this.client = null;
		}
	}

	trackBusinessOperation(operation: string, data: BusinessOperationData) {
		// Verificar si el cliente está disponible antes de usarlo
		if (!this.client) {
			this.logger.warn(`No se pudo registrar operación de negocio: ${operation} - Application Insights no disponible`);
			return;
		}

		try {
			if (typeof this.client.trackEvent === 'function') {
				this.client.trackEvent({
					name: 'BusinessOperation',
					properties: {
						operation,
						workspace: data.workspace,
						success: data.success.toString(),
						userId: data.userId,
						operationType: data.operationType,
						resourceType: data.resourceType,
						details: JSON.stringify(data.details),
						errorDetails: data.errorDetails ? JSON.stringify(data.errorDetails) : undefined,
						timestamp: new Date().toISOString(),
					},
					measurements: {
						duration: data.duration || 0,
					},
				});
			}

			// Si la operación falló, también registramos una métrica de error
			if (!data.success && typeof this.client.trackMetric === 'function') {
				this.client.trackMetric({
					name: `BusinessOperation_Error_${operation}`,
					value: 1,
					properties: {
						workspace: data.workspace,
						userId: data.userId,
						errorType: data.errorDetails?.type,
						timestamp: new Date().toISOString(),
					},
				});
			}
		} catch (error) {
			this.logger.warn(`Error al registrar operación de negocio: ${error.message}`);
		}
	}

	// Método específico para operaciones de workspace
	trackWorkspaceOperation(workspaceId: string, operation: string, data: Partial<BusinessOperationData>) {
		this.trackBusinessOperation(operation, {
			...data,
			workspace: workspaceId,
			resourceType: 'workspace',
		} as BusinessOperationData);
	}

	// Método específico para operaciones de documentos
	trackDocumentOperation(documentId: string, operation: string, data: Partial<BusinessOperationData>) {
		this.trackBusinessOperation(operation, {
			...data,
			details: { documentId, ...data.details },
			resourceType: 'document',
		} as BusinessOperationData);
	}

	// Método para registrar métricas de rendimiento de operaciones
	trackOperationPerformance(operation: string, duration: number, success: boolean, details?: any) {
		// Verificar si el cliente está disponible antes de usarlo
		if (!this.client) {
			this.logger.warn(`No se pudo registrar rendimiento de operación: ${operation} - Application Insights no disponible`);
			return;
		}

		try {
			if (typeof this.client.trackMetric === 'function') {
				this.client.trackMetric({
					name: `Operation_Duration_${operation}`,
					value: duration,
					properties: {
						success: success.toString(),
						...details,
					},
				});
			}
		} catch (error) {
			this.logger.warn(`Error al registrar rendimiento de operación: ${error.message}`);
		}
	}
}
