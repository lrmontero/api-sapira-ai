import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { CreateRoleDTO, UpdateRoleDTO } from './dto';
import { Role } from './schemas/role.schema';

@Injectable()
export class RoleService {
	constructor(@Inject('RoleModelToken') private readonly roleModel: Model<Role>) {}

	async getRoles() {
		const roles = await this.roleModel
			.find({})
			.populate({
				path: 'permissions',
				model: 'Permission',
			})
			.sort({ isDefault: -1 })
			.exec();

		return roles;
	}

	async createRole(userId: string, roleData: CreateRoleDTO) {
		const data = {
			...roleData,
			createdBy: userId,
			updatedBy: userId,
		};
		const role = new this.roleModel(data);
		return await role.save();
	}

	async getRole(userId: string, roleId: string) {
		const role = await this.roleModel.findById({ _id: roleId }).exec();

		return role;
	}

	async updateRoleDetail(userId: string, roleId: string, body: UpdateRoleDTO) {
		console.log('⚠️ updateRoleDetail - Inicio del método');
		console.log('📝 Datos recibidos:', { userId, roleId });
		console.log('📝 Body recibido:', JSON.stringify(body, null, 2));

		try {
			// Verificar si el rol existe antes de actualizar
			const existingRole = await this.roleModel.findById(roleId).exec();
			if (!existingRole) {
				console.log('❌ Rol no encontrado con ID:', roleId);
				return null;
			}
			console.log('✅ Rol encontrado:', existingRole._id);

			// Actualizar el rol
			const role = await this.roleModel.findByIdAndUpdate({ _id: roleId }, body, { new: true }).exec();
			console.log('✅ Rol actualizado:', role ? role._id : 'No se actualizó');
			console.log('📝 Datos del rol actualizado:', JSON.stringify(role, null, 2));

			return role;
		} catch (error) {
			console.error('❌ Error al actualizar rol:', error);
			return null;
		}
	}
}
