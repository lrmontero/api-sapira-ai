import { Injectable, OnModuleInit } from '@nestjs/common';

import { AuditConfigService } from '@/audit/audit-config.service';

/**
 * Configuración de auditoría para el módulo de workspaces
 * Este servicio se inicializa al cargar el módulo y configura qué endpoints
 * serán auditados y qué información específica se registrará
 */
@Injectable()
export class WorkspaceAuditConfig implements OnModuleInit {
	constructor(private readonly auditConfigService: AuditConfigService) {}

	onModuleInit() {
		// Configurar la auditoría para el endpoint de actualización de workspace
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}(\?.*)?$/,
			methods: ['PUT', 'PATCH'],
			eventType: 'Actualizar datos del espacio de trabajo',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					updatedFields: Object.keys(request.body),
					workspaceName: responseData.data?.name,
				};
			},
		});

		// Configurar la auditoría para el endpoint de creación de usuario en workspace
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}\/team\/create-user$/,
			methods: ['POST'],
			eventType: 'Crear usuario',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					userEmail: request.body.email,
					userName: request.body.name,
					userRole: request.body.role,
					success: responseData.data?.success || false,
				};
			},
		});

		// Configurar la auditoría para el endpoint de actualización de miembro del equipo
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}\/team\/[a-f\d]{24}(\?.*)?$/,
			methods: ['PUT', 'PATCH'],
			eventType: 'Actualizar datos de usuario',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					teamMemberId: request.params.teamMemberId,
					updatedFields: Object.keys(request.body),
					newRole: request.body.role,
					newStatus: request.body.status,
				};
			},
		});

		// Configurar la auditoría para el endpoint de eliminación de miembro del equipo
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}\/team\/[a-f\d]{24}(\?.*)?$/,
			methods: ['DELETE'],
			eventType: 'Eliminar usuario',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					teamMemberId: request.params.teamMemberId,
					success: responseData.data?.success || false,
					message: responseData.data?.message || '',
				};
			},
		});

		// Configurar la auditoría para el endpoint de creación de rol en workspace
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}\/roles(\?.*)?$/,
			methods: ['POST'],
			eventType: 'Crear rol',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					roleName: request.body.name,
					roleDescription: request.body.description,
					permissions: request.body.permissions,
					createdRoleId: responseData.data?._id,
				};
			},
		});

		// Configurar la auditoría para el endpoint de edición de rol en workspace
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}\/roles\/[a-f\d]{24}(\?.*)?$/,
			methods: ['PUT', 'PATCH'],
			eventType: 'Editar rol',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					roleId: request.params.roleId,
					updatedFields: Object.keys(request.body),
					roleName: request.body.name,
					roleDescription: request.body.description,
					permissions: request.body.permissions,
				};
			},
		});

		// Configurar la auditoría para el endpoint de eliminación de rol en workspace
		this.auditConfigService.addEndpointToAudit({
			path: /^\/workspace\/[a-f\d]{24}\/roles\/[a-f\d]{24}(\?.*)?$/,
			methods: ['DELETE'],
			eventType: 'Eliminar rol',
			customDetails: (responseData, request) => {
				return {
					workspaceId: request.params.workspaceId,
					roleId: request.params.roleId,
					success: responseData.data === true,
				};
			},
		});
	}
}
