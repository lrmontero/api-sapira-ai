import { Injectable, OnModuleInit } from '@nestjs/common';

import { AuditConfigService } from '@/audit/audit-config.service';

/**
 * Configuración de auditoría para el módulo de perfiles
 * Este servicio se inicializa al cargar el módulo y configura qué endpoints
 * serán auditados y qué información específica se registrará
 */
@Injectable()
export class ProfileAuditConfig implements OnModuleInit {
	constructor(private readonly auditConfigService: AuditConfigService) {}

	onModuleInit() {
		// Configurar la auditoría para el endpoint de actualización de perfil (/me)
		this.auditConfigService.addEndpointToAudit({
			path: /^\/profile\/me$/,
			methods: ['PATCH'],
			eventType: 'Actualizar mi perfil',
			customDetails: (responseData, request) => {
				// Verificar que exista un usuario autenticado con ID válido
				if (!request.user?.extension_oid || !/^[0-9a-fA-F]{24}$/.test(request.user.extension_oid)) {
					return null; // No registrar auditoría si no hay usuario autenticado
				}

				return {
					userId: request.user.extension_oid,
					userEmail: request.user.email || request.user.preferred_username || 'No disponible',
					updatedFields: Object.keys(request.body),
				};
			},
		});

		// Configurar la auditoría para el endpoint de subida de imagen de perfil (/image/upload/me)
		this.auditConfigService.addEndpointToAudit({
			path: /^\/profile\/image\/upload\/me(\?.*)?$/,
			methods: ['POST'],
			eventType: 'Actualizar mi perfil',
			customDetails: (responseData, request) => {
				// Verificar que exista un usuario autenticado con ID válido
				if (!request.user?.extension_oid || !/^[0-9a-fA-F]{24}$/.test(request.user.extension_oid)) {
					return null; // No registrar auditoría si no hay usuario autenticado
				}

				return {
					userId: request.user.extension_oid,
					userEmail: request.user.email || request.user.preferred_username || 'No disponible',
					imageUploaded: true,
				};
			},
		});

		// Configurar la auditoría para el endpoint de actualización de email
		this.auditConfigService.addEndpointToAudit({
			path: /^\/profile\/email\/[^/]+(\?.*)?$/,
			methods: ['PUT', 'PATCH'],
			eventType: 'Actualizar datos de usuario',
			customDetails: (responseData, request) => {
				// Verificar que exista un usuario autenticado con ID válido
				if (!request.user?.extension_oid || !/^[0-9a-fA-F]{24}$/.test(request.user.extension_oid)) {
					return null; // No registrar auditoría si no hay usuario autenticado
				}

				return {
					adminUserId: request.user.extension_oid,
					adminEmail: request.user.email || request.user.preferred_username || 'No disponible',
					targetUserEmail: request.params.email,
					updatedFields: Object.keys(request.body),
				};
			},
		});
	}
}
