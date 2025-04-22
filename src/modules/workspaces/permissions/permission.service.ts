import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { Role } from '../roles/schemas/role.schema';

import { CreatePermissionDTO, MassiveUpdatePermissionsDTO, UpdatePermissionDTO, UpdatePermissionSequencesDto } from './dto';
import { Permission } from './schemas/permission.schema';

@Injectable()
export class PermissionService {
	constructor(
		@Inject('PermissionModelToken') private readonly permissionModel: Model<Permission>,
		@Inject('RoleModelToken') private readonly roleModel: Model<Role>
	) {}

	async getPermissions(userId: string, isActive?: boolean): Promise<Permission[]> {
		const filter: any = {};

		// Si se proporciona isActive, filtrar por ese valor
		if (isActive !== undefined) {
			filter.isActive = isActive;
		}

		const permissions = await this.permissionModel.find(filter).sort({ sequence: 1, category: 1 }).exec();

		return permissions;
	}

	async createPermission(userId: string, createPermissionDto: CreatePermissionDTO): Promise<Permission> {
		// Verificar si ya existe un permiso con el mismo código
		const existingPermission = await this.permissionModel.findOne({ code: createPermissionDto.code }).exec();
		if (existingPermission) {
			throw new BadRequestException(`Ya existe un permiso con el código ${createPermissionDto.code}`);
		}

		// Crear el nuevo permiso
		const newPermission = new this.permissionModel({
			...createPermissionDto,
			createdBy: new Types.ObjectId(userId),
			updatedBy: new Types.ObjectId(userId),
			isActive: createPermissionDto.isActive !== undefined ? createPermissionDto.isActive : true,
		});

		// Guardar y devolver el permiso creado
		return await newPermission.save();
	}

	async massiveUpdatePermissions(userId: string, body: MassiveUpdatePermissionsDTO[]): Promise<Permission[]> {
		// Validar que todos los permisos existan antes de actualizar
		const permissionIds = body.map((p) => p._id);
		const existingPermissions = await this.permissionModel.find({ _id: { $in: permissionIds } }).exec();

		if (existingPermissions.length !== permissionIds.length) {
			throw new Error('Algunos permisos no existen en la base de datos');
		}

		// Actualizar cada permiso con el userId como updatedBy
		const updatePromises = body.map((permissionUpdate) => {
			return this.permissionModel
				.updateOne(
					{ _id: permissionUpdate._id },
					{
						$set: {
							...permissionUpdate,
							updatedBy: userId,
						},
					}
				)
				.exec();
		});

		await Promise.all(updatePromises);

		// Obtener todos los permisos actualizados
		const permissions = await this.permissionModel.find({ project: 'portal' }).sort({ category: 1, sequence: 1 }).exec();

		return permissions;
	}

	/**
	 * Actualiza un permiso específico por su ID
	 * @param id ID del permiso a actualizar
	 * @param userId ID del usuario que realiza la actualización
	 * @param updatePermissionDto Datos para actualizar el permiso
	 * @returns El permiso actualizado
	 */
	async updatePermission(id: string, userId: string, updatePermissionDto: UpdatePermissionDTO): Promise<Permission> {
		// Verificar si el permiso existe
		const permission = await this.permissionModel.findById(id).exec();
		if (!permission) {
			throw new NotFoundException(`No se encontró el permiso con ID ${id}`);
		}

		// Si se intenta actualizar el código, verificar que no exista otro permiso con ese código
		if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
			const existingPermission = await this.permissionModel.findOne({ code: updatePermissionDto.code }).exec();
			if (existingPermission) {
				throw new BadRequestException(`Ya existe un permiso con el código ${updatePermissionDto.code}`);
			}
		}

		// Actualizar el permiso
		const updatedPermission = await this.permissionModel.findByIdAndUpdate(
			id,
			{
				$set: {
					...updatePermissionDto,
					updatedBy: new Types.ObjectId(userId),
				},
			},
			{ new: true } // Devolver el documento actualizado
		);

		return updatedPermission;
	}

	/**
	 * Elimina un permiso por su ID y lo elimina de todos los roles que lo contienen
	 * @param id ID del permiso a eliminar
	 * @returns Mensaje de confirmación
	 */
	async deletePermission(id: string): Promise<{ message: string }> {
		// Verificar si el permiso existe
		const permission = await this.permissionModel.findById(id).exec();
		if (!permission) {
			throw new NotFoundException(`No se encontró el permiso con ID ${id}`);
		}

		// Buscar roles que contengan este permiso
		const rolesWithPermission = await this.roleModel.find({ permissions: new Types.ObjectId(id) }).exec();

		// Si hay roles que contienen este permiso, eliminarlo de esos roles
		if (rolesWithPermission.length > 0) {
			// Actualizar cada rol para eliminar el permiso
			const updateRolesPromises = rolesWithPermission.map((role) => {
				return this.roleModel.updateOne({ _id: role._id }, { $pull: { permissions: new Types.ObjectId(id) } }).exec();
			});

			// Esperar a que todas las actualizaciones se completen
			await Promise.all(updateRolesPromises);
		}

		// Eliminar el permiso
		await this.permissionModel.findByIdAndDelete(id);

		return {
			message: `Permiso ${permission.name} eliminado correctamente${rolesWithPermission.length > 0 ? ` y removido de ${rolesWithPermission.length} rol(es)` : ''}`,
		};
	}

	/**
	 * Ordena los permisos actualizando su secuencia (formato alternativo)
	 * @param userId ID del usuario que realiza la ordenación
	 * @param permissionsArrayDto DTO con los permisos y sus nuevas secuencias en formato permissions[]
	 * @returns Los permisos actualizados
	 */
	async updatePermissionsSequences(userId: string, updateSequencesDto: UpdatePermissionSequencesDto): Promise<Permission[]> {
		// Validar que todos los permisos existan
		const bulkOps = updateSequencesDto.permissions.map(({ _id, sequence }) => ({
			updateOne: {
				filter: { _id: new Types.ObjectId(_id) },
				update: { $set: { sequence } },
			},
		}));

		await this.permissionModel.bulkWrite(bulkOps);

		// Obtener los permisos actualizados ordenados por secuencia
		const updatedPermissions = await this.permissionModel.find().sort({ category: 1, sequence: 1 }).exec();

		return updatedPermissions;
	}
}
