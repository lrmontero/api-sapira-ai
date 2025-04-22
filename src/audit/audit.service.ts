import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Model, Schema as MongooseSchema } from 'mongoose';

import { BaseResponse } from '@/core/interfaces/base/base.interface';
import { BaseService } from '@/core/services/base/base.service';
import { AppLoggerService } from '@/logger/app-logger.service';

import { Audit, AuditDocument } from './schemas/audit.schema';

@Injectable()
export class AuditService extends BaseService {
	constructor(
		@Inject('AuditModelToken') private auditModel: Model<AuditDocument>,
		private readonly appLogger: AppLoggerService
	) {
		super();
	}

	/**
	 * Devuelve el modelo de auditoría para consultas directas
	 * @returns Modelo de Mongoose para Audit
	 */
	getAuditModel(): Model<AuditDocument> {
		return this.auditModel;
	}

	/**
	 * Registra un evento de auditoría en la base de datos
	 * @param userId ID o referencia del usuario que realiza la acción
	 * @param eventType Tipo de evento de auditoría
	 * @param req Objeto Request de Express
	 * @param details Detalles del evento (se convertirá a string JSON)
	 * @returns Respuesta con el documento de auditoría creado
	 */
	async registrarEvento(
		userId: string,
		eventType: string,
		action: string,
		resourceType: string,
		resourceId: string,
		details: any,
		deviceInfo: any,
		req: Request,
		body: any,
		params: any
	): Promise<BaseResponse<AuditDocument>> {
		try {
			// Verificar que el userId sea un ObjectId válido (formato hexadecimal de 24 caracteres)
			if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
				this.appLogger.warn(`Intento de registrar auditoría con userId inválido: ${userId}`);
				return this.handleError(new Error('El ID de usuario no es válido para registrar auditoría'), {
					context: 'AuditService.registrarEvento',
					metadata: { userId },
				});
			}

			// Convertir todos los objetos a string JSON
			const detailsString = typeof details === 'string' ? details : JSON.stringify(details);
			const deviceInfoString = typeof deviceInfo === 'string' ? deviceInfo : JSON.stringify(deviceInfo);

			// Convertir req y body a string de forma segura
			let reqString = '';
			try {
				// Extraer solo las propiedades importantes de req para evitar circular references
				const reqData = {
					url: req.url,
					method: req.method,
					headers: req.headers,
					params: req.params,
					query: req.query,
					ip: req.ip,
				};
				reqString = JSON.stringify(reqData);
			} catch (e) {
				reqString = 'Error al serializar request';
			}

			let bodyString = '';
			try {
				bodyString = typeof body === 'string' ? body : JSON.stringify(body);
			} catch (e) {
				bodyString = 'Error al serializar body';
			}

			let paramsString = '';
			try {
				paramsString = typeof params === 'string' ? params : JSON.stringify(params);
			} catch (e) {
				paramsString = 'Error al serializar params';
			}

			const auditData: Partial<Audit> = {
				userId: userId as unknown as MongooseSchema.Types.ObjectId,
				eventType,
				action,
				resourceType,
				resourceId,
				details: detailsString,
				deviceInfo: deviceInfoString,
				req: reqString,
				body: bodyString,
				params: paramsString,
				timestamp: new Date(),
			};

			// Guardar en la base de datos
			const audit = await this.auditModel.create(auditData);
			return this.createSuccessResponse(audit);
		} catch (error) {
			this.appLogger.error(`Error al registrar evento de auditoría: ${error.message}`, error.stack);
			return this.handleError(error, {
				context: 'AuditService.registrarEvento',
				metadata: { userId, eventType },
			});
		}
	}

	/**
	 * Elimina todos los registros de auditoría para un usuario específico
	 * @param userId ID del usuario cuyos registros se eliminarán
	 * @returns Respuesta con la cantidad de registros eliminados
	 */
	async eliminarRegistrosUsuario(userId: string): Promise<BaseResponse<{ deletedCount: number }>> {
		try {
			// Verificar que el userId sea un ObjectId válido (formato hexadecimal de 24 caracteres)
			if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
				this.appLogger.warn(`Intento de eliminar auditoría con userId inválido: ${userId}`);
				return this.handleError(new Error('El ID de usuario no es válido para eliminar registros de auditoría'), {
					context: 'AuditService.eliminarRegistrosUsuario',
					metadata: { userId },
				});
			}

			// Eliminar todos los registros de auditoría del usuario
			const result = await this.auditModel.deleteMany({
				userId: userId as unknown as MongooseSchema.Types.ObjectId,
			});

			this.appLogger.log(`Se eliminaron ${result.deletedCount} registros de auditoría para el usuario ${userId}`);

			return this.createSuccessResponse({ deletedCount: result.deletedCount });
		} catch (error) {
			this.appLogger.error(`Error al eliminar registros de auditoría: ${error.message}`, error.stack);
			return this.handleError(error, {
				context: 'AuditService.eliminarRegistrosUsuario',
				metadata: { userId },
			});
		}
	}
}
