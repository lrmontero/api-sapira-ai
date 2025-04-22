import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { MSGraphService } from '../utils/msgraph/msgraph.service';
import { WorkspaceService } from '../workspaces/workspace.service';

import { CreateUserAfterLoginDTO, CreateUserDTO, IsAuthDTO, UpdateUserDTO, UpdateUserMainWorkspaceDTO, UserDTO } from './dtos';
import { User } from './schemas/profile.schema';

@Injectable()
export class ProfileService {
	constructor(
		@Inject('UserModelToken') private readonly userModel: Model<User>,
		@Inject(forwardRef(() => WorkspaceService)) private readonly workspaceService: WorkspaceService,
		private readonly msgraphService: MSGraphService
	) {}

	// Crear al usuario despues del primer login
	async createUserAfterLogin(userData: CreateUserAfterLoginDTO): Promise<User> {
		try {
			// Se crea el usuario en la BD
			const user = new this.userModel(userData);
			const userCreated = await user.save();

			// Se actualiza el id de mongo en el usuario de MS Graph
			this.msgraphService.setUserMongoId(userCreated.oid, userCreated._id.toString());

			// Se crea el Workspace por defecto del usuario
			const workspaceData = {
				name: `Espacio de trabajo ${userCreated.name} ${userCreated.fatherName}`,
				contactEmail: userCreated.email,
			};

			const userCreatedId = userCreated._id.toString();
			const workspace = await this.workspaceService.createDefaultWorkspace(userCreatedId, workspaceData);

			// Se agrega el workspace creado al usuario
			const userUpdated = await this.userModel.findOneAndUpdate(
				{ _id: userCreated._id },
				{ $set: { mainWorkspace: workspace._id } },
				{ new: true }
			);

			return userUpdated;
		} catch (error) {
			console.error('Error en createUserAfterLogin:', error);
			throw error;
		}
	}

	// Setear oid y workspace para usuarios antiguos
	async setOidAfterLogin(user: UserDTO, oid: string): Promise<User> {
		try {
			// Se actualiza el id de mongo en el usuario de MS Graph
			await this.msgraphService.setUserMongoId(oid, user._id.toString());

			await this.setOid(user, oid);

			const setUserWorkspace = await this.setWorkspace(user);

			return setUserWorkspace;
		} catch (error) {
			console.error('Error en setOidAfterLogin:', error);
			throw new Error(error);
		}
	}

	// Setear oid
	async setOid(user: UserDTO, oid: string): Promise<User> {
		try {
			// Se setea el oid de ADB2C
			const updateData = {
				oid: oid,
			};

			// Se actualiza el usuario en la BD
			const userUpdated = await this.userModel.findOneAndUpdate({ _id: user._id }, { $set: updateData }, { new: true });

			return userUpdated;
		} catch (error) {
			throw new Error(error);
		}
	}

	// Setear workspace para usuarios antiguos
	async setWorkspace(user: UserDTO): Promise<User> {
		try {
			// Verificar si el usuario ya tiene workspaces existentes
			const userWorkspaces = await this.workspaceService.getWorkspacesByUser(user._id);
			console.log('Verificando workspaces existentes para el usuario:', user.email, userWorkspaces);

			let workspaceId;

			if (userWorkspaces && userWorkspaces.length > 0) {
				// Si ya tiene workspaces, usamos el primero como workspace principal
				workspaceId = userWorkspaces[0]._id;
				console.log('Usando workspace existente como principal:', workspaceId);
			} else {
				// Solo si no tiene workspaces, creamos uno nuevo
				console.log('Creando nuevo workspace para el usuario:', user.email);
				const workspaceData = {
					name: `Espacio de trabajo ${user.name} ${user.fatherName}`,
					contactEmail: user.email,
				};
				const workspace = await this.workspaceService.createDefaultWorkspace(user._id, workspaceData);
				workspaceId = workspace._id;
			}

			// Se agrega el workspace al usuario como workspace principal
			const userUpdated = await this.userModel.findOneAndUpdate({ _id: user._id }, { $set: { mainWorkspace: workspaceId } }, { new: true });

			return userUpdated;
		} catch (error) {
			console.error('Error en setWorkspace:', error);
			throw new Error(error);
		}
	}

	// Obtener usuario por email
	// Esta información es enviada al front end despues de que el usuario se loguea, por seguridad se omite el id del usuario
	async getUserAfterLogin(userEmail: string): Promise<User> {
		const user = await this.userModel.findOne(
			{ email: userEmail },
			{
				_id: 1,
				email: 1,
				name: 1,
				fatherName: 1,
				motherName: 1,
				mainWorkspace: 1,
				phoneNumber: 1,
				profileImage: 1,
				isActive: 1,
				cin: 1,
				birthday: 1,
				oid: 1,
			}
		);

		return user;
	}

	// Obtener id de usuario por email
	async getUserIdFromEmail(userEmail: string): Promise<User> {
		const user = await this.userModel.findOne(
			{ email: userEmail },
			{
				_id: 1,
			}
		);

		return user;
	}

	// Obtener usuario por id
	async getProfile(userId: string): Promise<User> {
		const user = await this.userModel.findById(userId, {
			_id: 0,
			email: 1,
			name: 1,
			fatherName: 1,
			motherName: 1,
			mainWorkspace: 1,
			phoneNumber: 1,
			profileImage: 1,
			isActive: 1,
			cin: 1,
			birthday: 1,
			oid: 1,
		});

		return user;
	}

	async checkIsAuth(userId: string): Promise<IsAuthDTO> {
		const user = await this.userModel.findById(userId, {
			_id: 0,
			meliToken: 1,
		});

		const hasToken = {
			isAuth: !!user.meliToken && !!user.meliToken.access_token,
		};

		return hasToken;
	}

	// Marcar workspace por defecto
	async setDefaultWorkspace(userId: string, workspaceId: string) {
		// Si workspaceId es null, establecer mainWorkspace a null explícitamente
		if (workspaceId === null) {
			await this.userModel.findByIdAndUpdate(userId, { $unset: { mainWorkspace: 1 } }, { new: true });
		} else {
			await this.userModel.findByIdAndUpdate(userId, { mainWorkspace: workspaceId }, { new: true });
		}

		const updatedUser = await this.userModel.findById(userId).select({
			_id: 1, // Incluimos _id para depuración
			email: 1,
			name: 1,
			fatherName: 1,
			motherName: 1,
			mainWorkspace: 1,
			phoneNumber: 1,
			profileImage: 1,
			isActive: 1,
			cin: 1,
			birthday: 1,
		});

		return updatedUser;
	}

	async createUser(userData: CreateUserDTO): Promise<User> {
		const user = new this.userModel(userData);
		return await user.save();
	}

	async updateUser(userId: string, userData: UpdateUserDTO): Promise<User> {
		let updatedUser;

		try {
			updatedUser = await this.userModel
				.findByIdAndUpdate(userId, userData, { new: true })
				.select('-_id email name fatherName motherName mainWorkspace phoneNumber profileImage isActive cin birthday oid');
		} catch (error) {
			throw new Error(error);
		}

		return updatedUser;
	}

	async updateUserMainWorkspace(userId: string, userData: UpdateUserMainWorkspaceDTO): Promise<User> {
		let updatedUser;

		try {
			updatedUser = await this.userModel
				.findByIdAndUpdate(userId, userData, { new: true })
				.select('-_id email name fatherName motherName mainWorkspace phoneNumber profileImage isActive cin birthday oid');
		} catch (error) {
			throw new Error(error);
		}

		return updatedUser;
	}

	async getUsers(): Promise<User[]> {
		const users = await this.userModel.find();
		return users;
	}

	async deleteUser(userId: string): Promise<User> {
		const deletedUser = await this.userModel.findByIdAndDelete(userId);
		return deletedUser;
	}

	async uploadProfileImage(userId: string, file: Express.Multer.File) {
		const user = await this.userModel.findById(userId);

		console.log(`Usuario con id ${userId} y ${file}`);
		if (!user) {
			throw new Error(`Usuario con id ${userId} no fue encontrado`);
			console.log(`Usuario con id ${userId} no fue encontrado ${file}`);
		}

		try {
			const updatedUser = await user.save();
			return updatedUser.profileImage;
		} catch (error) {
			throw new Error(error);
		}
	}
}
