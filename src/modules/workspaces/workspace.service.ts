import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { ProfileService } from '../profiles/profile.service';
import { CryptoService } from '../utils/crypto/crypto.service';
import { MSGraphService } from '../utils/msgraph/msgraph.service';

import { CreateWorkspaceDTO, InviteUserResponseDTO, UpdateWorkspaceDTO } from './dto';
import { CreateWorkspaceUserDTO, CreateWorkspaceUserResponseDTO } from './dto/create-workspace-user.dto';
import { RoleService } from './roles/role.service';
import { Workspace } from './schemas/workspace.schema';
import { UpdateUserTeamDTO } from './teams/dto/update-user-team.dto';
import { Team } from './teams/schemas/team.schema';
import { TeamService } from './teams/team.service';

interface InviteUserData {
	workspaceId: string;
	email: string;
}

@Injectable()
export class WorkspaceService {
	constructor(
		@Inject('WorkspaceModelToken') private readonly workspaceModel: Model<Workspace>,
		@Inject(forwardRef(() => ProfileService)) private readonly profileService: ProfileService,
		private readonly teamService: TeamService,
		private readonly cryptoService: CryptoService,
		private readonly msgraphService: MSGraphService,
		private readonly roleService: RoleService
	) {}

	async createDefaultWorkspace(userId: string, workspaceData: CreateWorkspaceDTO): Promise<Workspace> {
		// Se añade al usuario como un miembro del equipo con estado de propietario
		// TODO: Revisar el ROL que se le esta asignando
		// TODO: Revisar la Licencia
		const teamMembers = {
			user: new Types.ObjectId(userId),
			role: new Types.ObjectId('62d5bdbf9e98226c45433833'),
			license: 'free',
			ownerStatus: true,
			isActive: true,
			createdBy: userId,
			updatedBy: userId,
		};

		// Se añade los roles por defecto que estan asociados al workspace
		// TODO: Definir que determinaran estos roles
		const roles: Types.ObjectId[] = [new Types.ObjectId('62d5bdbf9e98226c45433833')];

		const defaultWorkspace = {
			...workspaceData,
			teamMembers,
			roles,
		};

		const workspace = new this.workspaceModel(defaultWorkspace);
		return await workspace.save();
	}

	// Version antigua que usa los teams como colección
	async getWorkspacesByUserId(userId) {
		const teams = await this.teamService.getTeamsByUser({ userId });

		const teamIds = teams.map((e) => e._id);

		const workspaces = await this.workspaceModel
			.find({ team: { $in: teamIds } }, { name: 1, logo: 1, buttonColor: 1, buttonTextColor: 1, team: 1, isDefault: 1, isActive: 1 })
			.populate({
				path: 'team',
				select: 'role',
				populate: {
					path: 'role',
					select: 'name code',
				},
			})
			.exec();

		const workspacesFormated = workspaces.map((e) => {
			let role;
			if (e.team[0] instanceof Team) {
				role = e.team[0].role;
			}
			return {
				_id: e._id,
				name: e.name,
				logo: e.logo,
				buttonColor: e.buttonColor,
				buttonTextColor: e.buttonTextColor,
				isDefault: e.isDefault,
				isActive: e.isActive,
				role: role,
			};
		});
		return workspacesFormated;
	}

	// Version nueva que usa teamMember
	async getWorkspacesByUser(userId: string) {
		const workspaces = await this.workspaceModel
			.find({ 'teamMembers.user': new Types.ObjectId(userId) })
			.select({
				name: 1,
				logo: 1,
				isDefault: 1,
				isActive: 1,
				teamMembers: 1,
				isOwner: 1,
			})
			.populate({
				path: 'teamMembers.role',
				select: 'name',
			})
			.populate({
				path: 'teamMembers.user',
				select: '_id',
			})
			.lean()
			.exec();

		return workspaces.map((workspace) => {
			// Encontrar el rol del usuario actual en el workspace
			const userTeamMember = workspace.teamMembers.find((member) => member.user._id.toString() === userId);

			return {
				_id: workspace._id,
				name: workspace.name,
				logo: workspace.logo,
				isDefault: workspace.isDefault,
				isActive: workspace.isActive,
				role: userTeamMember?.role || null,
				teamMembersCount: workspace.teamMembers.length,
				isOwner: userTeamMember?.ownerStatus || false,
			};
		});
	}

	async getMyWorkspacePermissions(userId: string, workspaceId: string) {
		const workspace = await this.workspaceModel
			.findOne({ _id: workspaceId }, 'teamMembers')
			.populate({
				path: 'teamMembers.role',
				select: 'permissions',
				populate: {
					path: 'permissions',
					model: 'Permission',
					select: 'code -_id',
				},
			})
			.exec();

		// Filtrar teamMembers por userId después de recuperar el documento
		let teamMembers;
		if (workspace && workspace.teamMembers) {
			teamMembers = workspace.teamMembers.filter((member) => member.user.toString() === userId);
		}

		let permissions;
		if (teamMembers && teamMembers[0].role && teamMembers[0].role.permissions) {
			permissions = teamMembers[0].role.permissions;
		} else {
			return [];
		}

		return permissions;
	}

	// Marcar workspace por defecto
	async setAsDefaultWorkspace(userId: string, workspaceId: string) {
		// Setear todos los workspaces del usuario en false
		await this.workspaceModel.updateMany({ 'teamMembers.user': new Types.ObjectId(userId) }, { isDefault: false });
		await this.workspaceModel.findByIdAndUpdate(workspaceId, { isDefault: true }, { new: true });

		// Setear el mainWorkspace en user
		try {
			const userData = { mainWorkspace: workspaceId };
			await this.profileService.updateUserMainWorkspace(userId, userData);
		} catch (error) {
			throw new Error(error);
		}

		const workspaces = await this.workspaceModel
			.find({ 'teamMembers.user': Types.ObjectId.createFromHexString(userId) }, { name: 1, logo: 1, isDefault: 1 })
			.exec();

		return workspaces;
	}

	// Obtener data de un workpacepor id
	async getWorkspace(workspaceId: string): Promise<Workspace> {
		try {
			const workspaceCrypto = await this.workspaceModel
				.findById(workspaceId)
				.populate({
					path: 'teamMembers.user',
					select: 'name fatherName motherName email',
				})
				.populate({
					path: 'teamMembers.role',
					model: 'Role',
					select: 'name code permissions isDefault isActive',
					populate: {
						path: 'permissions',
						model: 'Permission',
						select: 'name code',
					},
				})
				.populate({
					path: 'roles',
					model: 'Role',
					select: 'name code permissions isDefault isActive',
					populate: {
						path: 'permissions',
						model: 'Permission',
						select: 'name code',
					},
				});

			const workspace = await this.decryptAttributes(workspaceCrypto);

			return workspace;
		} catch (error) {
			return;
		}
	}

	async createWorkspace(workspaceData: CreateWorkspaceDTO): Promise<Workspace> {
		const workspace = new this.workspaceModel(workspaceData);
		return await workspace.save();
	}

	// Obtener el team de un workspace
	async getWorkspaceTeam(
		userId: string,
		workspaceId: string,
		search: string,
		pageNumber: number = 1,
		limitNumber: number = 20
	): Promise<{ members: Team[]; total: number; page: number; limit: number }> {
		const searchRegex = new RegExp(search, 'i'); // 'i' makes it case insensitive

		const workspace = await this.workspaceModel
			.findOne({ _id: workspaceId }, 'teamMembers')
			.populate({
				path: 'teamMembers.user',
				match: {
					$or: [{ name: { $regex: searchRegex } }, { email: { $regex: searchRegex } }],
				},
				select: 'email code name fatherName motherName phoneNumber profileImage',
			})
			.populate({
				path: 'teamMembers.role',
				select: 'name permissions',
				populate: {
					path: 'permissions',
					model: 'Permission',
					select: 'name code category description',
				},
			})
			.exec();

		// Filter out any null values that may have resulted from the population step
		const filteredMembers = workspace.teamMembers.filter((member) => member.user != null);

		// Calcular el total de miembros filtrados
		const total = filteredMembers.length;

		// Validar que pageNumber sea un número válido
		const page = Math.max(1, pageNumber);

		// Validar que limitNumber sea un número válido
		const limit = Math.max(1, Math.min(limitNumber, 100)); // Máximo 100 registros por página

		// Calcular índices para la paginación
		const startIndex = (page - 1) * limit;
		const endIndex = Math.min(startIndex + limit, total);

		// Obtener solo los miembros de la página actual
		const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

		return {
			members: paginatedMembers,
			total,
			page,
			limit,
		};
	}

	async getWorkspaceTeamMember(userId: string, workspaceId: string, teamMemberId: string): Promise<any> {
		const workspace = await this.workspaceModel
			.findOne({ _id: workspaceId }, 'teamMembers')
			.populate({
				path: 'teamMembers.user',
				select: 'email name fatherName phoneNumber profileImage',
			})
			.exec();

		// Filtrar los teamMembers por teamMemberId
		let teamMember = {};
		if (workspace && workspace.teamMembers) {
			teamMember = workspace.teamMembers.filter((tm) => tm._id.toString() === teamMemberId);
		}

		return teamMember[0];
	}

	async updateWorkspaceTeamMember(userId: string, workspaceId: string, teamMemberId: string, body: UpdateUserTeamDTO): Promise<boolean> {
		const updateObject = {};
		for (const key in body) {
			updateObject[`teamMembers.$.${key}`] = body[key];
		}

		const result = await this.workspaceModel
			.updateOne({ _id: new Types.ObjectId(workspaceId), 'teamMembers._id': new Types.ObjectId(teamMemberId) }, { $set: updateObject })
			.exec();

		if (result.acknowledged && result.modifiedCount > 0 && result.matchedCount > 0) {
			return true;
		} else {
			return false;
		}
	}

	async deleteWorkspaceTeamMember(userId: string, workspaceId: string, teamMemberId: string): Promise<{ success: boolean; message: string }> {
		try {
			// Primero, obtener información completa del workspace
			const workspaceCompleto = await this.workspaceModel.findOne({ _id: new Types.ObjectId(workspaceId) });

			if (!workspaceCompleto) {
				return { success: false, message: 'No se encontró el workspace solicitado' };
			}

			// Obtener información del miembro del equipo que se va a eliminar
			const workspace = await this.workspaceModel.findOne(
				{ _id: new Types.ObjectId(workspaceId) },
				{ teamMembers: { $elemMatch: { _id: new Types.ObjectId(teamMemberId) } } }
			);

			if (!workspace || !workspace.teamMembers || workspace.teamMembers.length === 0) {
				console.log('No se encontró el miembro del equipo en el workspace');
				return { success: false, message: 'No se encontró el miembro del equipo en el workspace' };
			}

			// Obtener el ID del usuario que se va a eliminar del equipo
			const userIdToRemove = workspace.teamMembers[0].user.toString();
			console.log('Verificando si se puede eliminar al usuario con ID:', userIdToRemove, 'del workspace:', workspaceId);

			// Verificar si el usuario es dueño del workspace
			const esDueno = workspace.teamMembers[0].ownerStatus === true;
			if (esDueno) {
				console.log('No se puede eliminar al usuario porque es dueño del workspace');
				return { success: false, message: 'No se puede eliminar al usuario porque es dueño del workspace' };
			}

			// Verificar si el usuario pertenece a otros workspaces
			const otrosWorkspaces = await this.workspaceModel.find({
				_id: { $ne: new Types.ObjectId(workspaceId) },
				'teamMembers.user': new Types.ObjectId(userIdToRemove),
			});

			const perteneceASoloUnWorkspace = otrosWorkspaces.length === 0;
			console.log('¿El usuario pertenece solo a este workspace?', perteneceASoloUnWorkspace);

			// Eliminar al miembro del equipo del workspace
			const result = await this.workspaceModel
				.updateOne({ _id: new Types.ObjectId(workspaceId) }, { $pull: { teamMembers: { _id: new Types.ObjectId(teamMemberId) } } })
				.exec();

			if (result.acknowledged && result.modifiedCount > 0 && result.matchedCount > 0) {
				// Si el usuario pertenece solo a este workspace y no es dueño, crear un nuevo workspace
				if (perteneceASoloUnWorkspace) {
					console.log('El usuario solo pertenecía a este workspace. Creando un nuevo workspace donde sea dueño...');

					// Obtener información del usuario para crear el nuevo workspace
					const userProfile = await this.profileService.getProfile(userIdToRemove);

					if (!userProfile) {
						return { success: false, message: 'No se pudo obtener la información del usuario' };
					}

					// Crear un nuevo workspace donde el usuario sea dueño
					const workspaceData = {
						name: `Workspace de ${userProfile.name}`,
						contactEmail: userProfile.email,
					};

					const nuevoWorkspace = await this.createDefaultWorkspace(userIdToRemove, workspaceData);
					console.log('Nuevo workspace creado:', nuevoWorkspace._id.toString());

					// Establecer el nuevo workspace como principal para el usuario
					await this.profileService.setDefaultWorkspace(userIdToRemove, nuevoWorkspace._id.toString());
					console.log('Se estableció el nuevo workspace como principal para el usuario');

					return {
						success: true,
						message: 'El usuario ha sido eliminado del workspace y se ha creado un nuevo workspace donde es dueño',
					};
				} else {
					// Si el usuario pertenece a otros workspaces, actualizar su workspace principal si es necesario
					const userProfile = await this.profileService.getProfile(userIdToRemove);

					if (userProfile && userProfile.mainWorkspace && userProfile.mainWorkspace.toString() === workspaceId) {
						console.log('El workspace eliminado era el principal del usuario. Actualizando perfil...');

						// Establecer otro workspace como principal
						const otroWorkspace = otrosWorkspaces[0];
						await this.profileService.setDefaultWorkspace(userIdToRemove, otroWorkspace._id.toString());
						console.log('Se estableció un nuevo workspace principal para el usuario:', otroWorkspace._id.toString());
					}

					return {
						success: true,
						message: 'El usuario ha sido eliminado correctamente del workspace',
					};
				}
			} else {
				console.log('No se pudo eliminar el miembro del equipo del workspace');
				return { success: false, message: 'No se pudo eliminar el miembro del equipo del workspace' };
			}
		} catch (error) {
			console.error('Error al eliminar miembro del equipo:', error);
			return { success: false, message: `Error al eliminar miembro del equipo: ${error.message}` };
		}
	}

	// Invitar usuario a otro workspace
	async inviteUser(userId: string, workspaceId: string, data: InviteUserData): Promise<InviteUserResponseDTO> {
		const { email } = data;

		try {
			// Se busca al usuario a partir del email
			const invitedUserId = await this.profileService.getUserIdFromEmail(email);

			if (!invitedUserId) {
				return { success: false, message: 'Usuario no encontrado' };
			}

			const teamMember = {
				//teamMemberId: new Types.ObjectId(),
				user: invitedUserId._id,
				role: new Types.ObjectId('6678c9f9f0cee7ab31e28aec'),
				license: 'free',
				ownerStatus: false,
				isActive: true,
				createdBy: userId,
				updatedBy: userId,
			};

			// Se busca si el usuario ya esta en el workspace
			const userInWorkspace = await this.workspaceModel.findOne({ _id: workspaceId, 'teamMembers.user': teamMember.user });

			// Se agrega en el array de teamMember del workspaceId sin duplicar el registro en caso que exista
			if (!userInWorkspace) {
				await this.workspaceModel.updateOne({ _id: workspaceId }, { $push: { teamMembers: teamMember } }).exec();
				// console.log('update.result =====> ', update);
				return { success: true, message: 'Usuario añadido correctamente al Equipo' };
			} else {
				return { success: false, message: 'Este usuario ya pertenece al Equipo' };
			}
		} catch (error) {
			return { success: false, message: 'Error al añadir usuario' };
		}
	}

	// Obtener los roles de un workspace
	async getWorkspaceRoles(userId: string, workspaceId: string): Promise<any[]> {
		try {
			// Verificar si el usuario tiene acceso al workspace
			const userTeamMember = await this.workspaceModel.findOne({
				_id: new Types.ObjectId(workspaceId),
				'teamMembers.user': new Types.ObjectId(userId),
				'teamMembers.isActive': true,
			});

			if (!userTeamMember) {
				console.log('El usuario no tiene acceso al workspace');
				return [];
			}

			// Obtener todos los roles del workspace sin filtrar por búsqueda
			const workspace = await this.workspaceModel
				.findOne({ _id: new Types.ObjectId(workspaceId) }, 'roles')
				.populate({
					path: 'roles',
					model: 'Role',
					populate: {
						path: 'permissions',
						model: 'Permission',
					},
				})
				.exec();

			// Ordenar los roles (los predeterminados primero)
			if (workspace && workspace.roles) {
				workspace.roles.sort((a: any, b: any) => b.isDefault - a.isDefault);
			}

			// Asegurarse de que workspace y workspace.roles estén definidos
			if (workspace && workspace.roles) {
				return workspace.roles;
			} else {
				return [];
			}
		} catch (error) {
			console.error('Error al obtener roles del workspace:', error);
			throw new Error(`Error al obtener roles: ${error.message}`);
		}
	}

	// TODO. Verificar si se utiliza - Obtener el team de un workspace
	async getWorkspaceRoleDetail(userId: string, workspaceId: string, roleId: string): Promise<any> {
		try {
			const workspace = await this.workspaceModel
				.findOne({ _id: workspaceId }, 'roles')
				.populate({
					path: 'roles',
					model: 'Role',
					match: { _id: roleId },
					populate: {
						path: 'permissions',
						model: 'Permission',
					},
				})
				.exec();

			// Ensure that workspace and workspace.roles are defined
			if (workspace && workspace.roles[0]) {
				return workspace.roles[0];
			} else {
				return {};
			}
		} catch (error) {
			console.log('error al obtener roles del workspace', error);
			throw new Error(error);
		}
	}

	// Crear un rol en un workspace
	async createWorkspaceRole(userId: string, workspaceId: string, roleData: any): Promise<any> {
		try {
			// Verificar si el usuario tiene acceso al workspace y es administrador
			const workspace = await this.workspaceModel.findOne({
				_id: new Types.ObjectId(workspaceId),
				'teamMembers.user': new Types.ObjectId(userId),
				'teamMembers.isActive': true,
			});

			if (!workspace) {
				throw new Error('No tienes permisos para crear roles en este workspace');
			}

			// Verificar si el usuario es dueño del workspace
			const userTeamMember = workspace.teamMembers.find((member) => member.user.toString() === userId && member.ownerStatus);

			if (!userTeamMember) {
				throw new Error('Solo los administradores pueden crear roles en el workspace');
			}

			// Crear el rol en la colección de roles usando el servicio de roles
			const roleDataToCreate = {
				name: roleData.name,
				code: roleData.code,
				description: roleData.description,
				isDefault: false,
				isActive: roleData.isActive !== undefined ? roleData.isActive : true,
				permissions: roleData.permissions || [],
			};

			// Crear el rol usando el servicio de roles
			const savedRole = await this.roleService.createRole(userId, roleDataToCreate);

			// Agregar el rol al workspace
			await this.workspaceModel.updateOne({ _id: new Types.ObjectId(workspaceId) }, { $addToSet: { roles: savedRole._id } }).exec();

			return savedRole;
		} catch (error) {
			console.error('Error al crear rol en el workspace:', error);
			throw new Error(`Error al crear rol: ${error.message}`);
		}
	}

	// Editar un rol en un workspace
	async editWorkspaceRole(userId: string, workspaceId: string, roleId: string, roleData: any): Promise<any> {
		try {
			console.log('⚠️ editWorkspaceRole - Inicio del método');
			console.log('📝 Datos recibidos:', { userId, workspaceId, roleId });
			console.log('📝 roleData recibido:', JSON.stringify(roleData, null, 2));

			// Verificar si el usuario tiene acceso al workspace y es administrador
			const workspace = await this.workspaceModel.findOne({
				_id: new Types.ObjectId(workspaceId),
				'teamMembers.user': new Types.ObjectId(userId),
				'teamMembers.isActive': true,
				roles: new Types.ObjectId(roleId), // Verificar que el rol pertenezca al workspace
			});

			if (!workspace) {
				console.log('❌ No se encontró el workspace o el usuario no tiene permisos');
				throw new Error('No tienes permisos para editar roles en este workspace o el rol no pertenece al workspace');
			}

			console.log('✅ Workspace encontrado:', workspace._id);

			// Verificar si el usuario es dueño del workspace
			const userTeamMember = workspace.teamMembers.find((member) => member.user.toString() === userId && member.ownerStatus);

			if (!userTeamMember) {
				console.log('❌ El usuario no es administrador del workspace');
				throw new Error('Solo los administradores pueden editar roles en el workspace');
			}

			console.log('✅ Usuario es administrador del workspace');

			// Preparar los datos para actualizar
			const updateData: any = {
				updatedBy: userId,
				updatedAt: new Date(),
			};

			// Solo actualizar los campos proporcionados
			if (roleData.name !== undefined) updateData.name = roleData.name;
			if (roleData.code !== undefined) updateData.code = roleData.code;
			if (roleData.isActive !== undefined) updateData.isActive = roleData.isActive;
			if (roleData.permissions !== undefined) updateData.permissions = roleData.permissions;
			if (roleData.description !== undefined) updateData.description = roleData.description;

			console.log('📝 Datos a actualizar:', JSON.stringify(updateData, null, 2));

			// Actualizar el rol usando el servicio de roles
			console.log('⏳ Llamando a roleService.updateRoleDetail con roleId:', roleId);
			const updatedRole = await this.roleService.updateRoleDetail(userId, roleId, updateData);
			console.log('📝 Resultado de roleService.updateRoleDetail:', updatedRole ? 'Rol actualizado' : 'No se actualizó el rol');

			if (!updatedRole) {
				console.log('❌ No se encontró el rol para actualizar');
				throw new Error('No se encontró el rol para actualizar');
			}

			console.log('✅ Rol actualizado correctamente:', updatedRole._id);
			return updatedRole;
		} catch (error) {
			console.error('❌ Error al editar rol en el workspace:', error);
			throw new Error(`Error al editar rol: ${error.message}`);
		}
	}

	// Eliminar role de un workspace
	async deleteWorkspaceRole(userId: string, workspaceId: string, roleId: string): Promise<boolean> {
		try {
			const update = await this.workspaceModel.updateOne({ _id: workspaceId }, { $pull: { roles: new Types.ObjectId(roleId) } }).exec();
			if (update.acknowledged && update.modifiedCount > 0 && update.matchedCount > 0) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.log('error al obtener roles del workspace', error);
		}
	}

	// Actualizar atributos de un workspace
	async updateWorkspace(workspaceId: string, updateData: UpdateWorkspaceDTO) {
		const workspace = await this.workspaceModel
			.findByIdAndUpdate(workspaceId, updateData, { new: true })
			.select({
				name: 1,
				logo: 1,
				contactEmail: 1,
				isActive: 1,
				buttonColor: 1,
				buttonTextColor: 1,
				accountCin: 1,
				accountEmail: 1,
			})
			.exec();

		if (!workspace) {
			throw new Error('Workspace no encontrado');
		}

		return workspace;
	}

	// Eliminar un workspace
	async deleteWorkspace(workspaceId: string) {
		const workspace = await this.workspaceModel.findById(workspaceId);

		if (!workspace) {
			throw new Error('Workspace no encontrado');
		}

		if (workspace.isDefault) {
			throw new Error('No se puede eliminar el workspace por defecto');
		}

		// Verificar si hay usuarios activos en el workspace que no sean owners
		const activeNonOwnerMembers = workspace.teamMembers.filter((member) => member.isActive && !member.ownerStatus);
		if (activeNonOwnerMembers.length > 0) {
			throw new Error('No se puede eliminar el workspace porque tiene usuarios activos que no son propietarios');
		}

		await this.workspaceModel.findByIdAndDelete(workspaceId);
		return true;
	}

	/*
	 ** Funciones
	 */

	// Crear un usuario en Azure B2C y agregarlo al workspace
	async createWorkspaceUser(userId: string, workspaceId: string, userData: CreateWorkspaceUserDTO): Promise<CreateWorkspaceUserResponseDTO> {
		try {
			// Verificar si el workspace existe
			const workspace = await this.workspaceModel.findById(workspaceId);
			if (!workspace) {
				return {
					success: false,
					message: 'El workspace no existe',
				};
			}

			// Verificar si el usuario tiene permisos para agregar usuarios al workspace
			const userTeamMember = workspace.teamMembers.find((member) => member.user.toString() === userId && member.isActive);

			if (!userTeamMember) {
				return {
					success: false,
					message: 'No tienes permisos para agregar usuarios a este workspace',
				};
			}

			// Verificar si el usuario ya existe en Azure B2C
			console.log('Verificando si el usuario existe en Azure B2C:', userData.email);
			const existingUserResponse = await this.msgraphService.getUserByEmail(userData.email);
			console.log('Respuesta de búsqueda en Azure B2C:', JSON.stringify(existingUserResponse, null, 2));
			let azureUserId = null;

			// Si el usuario no existe en Azure B2C, crearlo
			if (!existingUserResponse || !existingUserResponse.value || existingUserResponse.value.length === 0) {
				// Crear usuario en Azure B2C
				console.log('Creando usuario en Azure B2C:', userData.email);
				const createB2CUserResult = await this.msgraphService.createB2CUser({
					name: userData.name,
					fatherName: userData.fatherName,
					motherName: userData.motherName,
					email: userData.email,
					password: userData.password,
				});
				console.log('Resultado de creación en Azure B2C:', JSON.stringify(createB2CUserResult, null, 2));

				if (!createB2CUserResult.success) {
					return {
						success: false,
						message: 'Error al crear usuario en Azure B2C',
						error: createB2CUserResult.error,
					};
				}

				azureUserId = createB2CUserResult.userId;
				console.log('Usuario creado en Azure B2C con ID:', azureUserId);
			} else {
				// Extraer el ID del usuario existente del array de resultados
				azureUserId = existingUserResponse.value[0]?.id;
				console.log('Usuario existente en Azure B2C con ID:', azureUserId);
			}

			// Verificar si el usuario ya existe en la base de datos
			const existingProfile = await this.profileService.getUserIdFromEmail(userData.email);
			let profileId = null;

			// Si el usuario no existe en la base de datos, crearlo
			if (!existingProfile) {
				// Crear perfil en la base de datos
				const newProfile = await this.profileService.createUser({
					name: userData.name,
					code: userData.code,
					fatherName: userData.fatherName,
					motherName: userData.motherName,
					email: userData.email,
					oid: azureUserId,
					isActive: true,
				});

				profileId = newProfile._id.toString();
			} else {
				profileId = existingProfile._id.toString();
			}

			// Verificar si el usuario ya es miembro del workspace
			const isMember = workspace.teamMembers.some((member) => member.user.toString() === profileId);

			if (isMember) {
				return {
					success: false,
					message: 'El usuario ya es miembro de este workspace',
					userId: azureUserId,
					profileId,
				};
			}

			// Determinar el rol a asignar (usar el rol proporcionado o el rol por defecto)
			const roleId = userData.roleId || '62d5bdbf9e98226c45433833'; // Usar el rol por defecto si no se proporciona uno

			// Agregar el usuario al workspace
			const teamMember = {
				user: new Types.ObjectId(profileId),
				role: new Types.ObjectId(roleId),
				license: 'free',
				ownerStatus: false,
				isActive: true,
				createdBy: new Types.ObjectId(userId),
				updatedBy: new Types.ObjectId(userId),
			};

			// Actualizar el workspace con el nuevo miembro
			await this.workspaceModel.updateOne({ _id: new Types.ObjectId(workspaceId) }, { $push: { teamMembers: teamMember } });

			return {
				success: true,
				message: 'Usuario creado y agregado al workspace correctamente',
				userId: azureUserId,
				profileId,
			};
		} catch (error) {
			console.error('Error al crear usuario en workspace:', error);
			return {
				success: false,
				message: 'Error al crear usuario en workspace',
				error: error.message,
			};
		}
	}

	// Funcion para desencriptar atributos de workspace
	async decryptAttributes(data) {
		if (data.vat) data.vat = await this.cryptoService.decrypt(data.vat);
		if (data.accountFullName) data.accountFullName = await this.cryptoService.decrypt(data.accountFullName);
		if (data.billingEmail) data.billingEmail = await this.cryptoService.decrypt(data.billingEmail);
		if (data.accountCin) data.accountCin = await this.cryptoService.decrypt(data.accountCin);
		if (data.bankName) data.bankName = await this.cryptoService.decrypt(data.bankName);
		if (data.accountType) data.accountType = await this.cryptoService.decrypt(data.accountType);
		if (data.accountNumber) data.accountNumber = await this.cryptoService.decrypt(data.accountNumber);
		if (data.nameServer) data.nameServer = await this.cryptoService.decrypt(data.nameServer);
		if (data.port) data.port = await this.cryptoService.decrypt(data.port);
		if (data.userNameEmail) data.userNameEmail = await this.cryptoService.decrypt(data.userNameEmail);
		if (data.userPasswordEmail) data.userPasswordEmail = await this.cryptoService.decrypt(data.userPasswordEmail);

		return data;
	}
}
