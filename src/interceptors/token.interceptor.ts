import { CallHandler, ExecutionContext, forwardRef, Inject, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { EventsService } from '@/events/services/events.service';
import { ProfileService } from '@/modules/profiles/profile.service';
import { WorkspaceService } from '@/modules/workspaces/workspace.service';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
	constructor(
		@Inject(forwardRef(() => ProfileService))
		private readonly profileService: ProfileService,
		@Inject(forwardRef(() => EventsService))
		private readonly eventsService: EventsService,
		@Inject(forwardRef(() => WorkspaceService))
		private readonly workspaceService: WorkspaceService,
		private reflector: Reflector
	) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const req = context.switchToHttp().getRequest();

		// Verificar si es una ruta pública
		const isPublic = this.reflector.get('isPublic', context.getHandler());
		if (isPublic) {
			return next.handle();
		}

		const token = req.headers.authorization?.split(' ')[1];

		// Si existe un token y la ruta no es pública, se verifica y se guarda en req.user
		if (token) {
			let user;
			try {
				if (!req.user) {
					throw new UnauthorizedException('Token inválido');
				}

				// obtener el usuario de la BD
				user = await this.profileService.getUserAfterLogin(req.user.emails[0]);

				// Se verifica si el usuario tiene seteado en extension_oid el id de mongo de la BD
				// Verificar si extension_oid es un ID de MongoDB válido o solo un placeholder
				const hasValidExtensionOid = req.user.extension_oid && req.user.extension_oid !== 'oid' && req.user.extension_oid.length >= 24;

				if (!hasValidExtensionOid || !user) {
					// Si el usuario no existe en la BD se crea, al crearse se setean los oid (adb2c en mongo) y extension_oid (mongo en adb2c), se crea el workspace y se asigna workspace principal
					if (!user) {
						const userLoggedIn = {
							email: req.user.emails[0],
							name: req.user.given_name,
							fatherName: req.user.family_name,
							motherName: req.user.extension_SegundoApellido,
							oid: req.user.oid,
						};

						user = await this.profileService.createUserAfterLogin(userLoggedIn);
					}

					// Si el usuario no tiene oid se setea el oid (adb2c en mongo) y extension_oid (mongo en adb2c), se setea el workspace principal
					// Aqui falta validar si el usuario esta en el teamMember y agregarlo al teamMember del workspace principal
					if (!user.oid || req.user.extension_oid === 'oid' || !hasValidExtensionOid) {
						user = await this.profileService.setOidAfterLogin(user, req.user.oid);
					}

					req.user.extension_oid = user._id.toString();
				}

				// Verificar si el usuario tiene workspace y crear uno por defecto si no tiene
				const userWorkspaces = await this.workspaceService.getWorkspacesByUser(user._id.toString());

				// Solo crear un workspace por defecto si el usuario no tiene ninguno
				if (!userWorkspaces || userWorkspaces.length === 0) {
					// Crear workspace por defecto
					await this.workspaceService.createDefaultWorkspace(user._id.toString(), {
						name: `Workspace de ${user.name}`,
						contactEmail: user.email,
					});
				}

				// Se guarda el id de mongo en extension_oid
				req.user.extension_oid = user._id.toString();

				// Si no tiene el oid seteado, seteo el oid
				if (!user.oid) {
					user = await this.profileService.setOid(user, req.user.oid);
				}

				// Si no tiene el workspace principal seteado, verificamos si ya tiene workspaces existentes
				// y solo creamos uno nuevo si no tiene ninguno
				if (user.mainWorkspace === undefined || user.mainWorkspace === null || user.mainWorkspace === '') {
					// Verificar nuevamente si el usuario tiene workspaces (podría haberse creado uno en pasos anteriores)
					const currentWorkspaces = await this.workspaceService.getWorkspacesByUser(user._id.toString());

					if (currentWorkspaces && currentWorkspaces.length > 0) {
						// Si ya tiene workspaces, simplemente establecemos el primero como principal
						const firstWorkspaceId = currentWorkspaces[0]._id.toString();

						user = await this.profileService.setDefaultWorkspace(user._id.toString(), firstWorkspaceId);
					} else {
						// Solo si realmente no tiene ningún workspace, creamos uno nuevo
						user = await this.profileService.setWorkspace(user);
					}
				}

				return next.handle();
			} catch (error) {
				/* eslint-disable-next-line no-console */
				console.error('Error al verificar el token:', error);
				throw new UnauthorizedException('Token inválido');
			}
		}

		return next.handle();
	}
}
