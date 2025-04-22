import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qs from 'qs';

import { CreateB2CUserDTO, CreateB2CUserResponseDTO } from './dto/create-b2c-user.dto';

@Injectable()
export class MSGraphService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService
	) {}

	private readonly graphUrl = 'https://graph.microsoft.com/v1.0';

	async getAccessToken() {
		try {
			const data = qs.stringify({
				client_id: this.configService.get<string>('AZURE_CLIENT_ID'),
				grant_type: 'client_credentials',
				client_secret: this.configService.get<string>('AZURE_CLIENT_SECRET'),
				resource: 'https://graph.microsoft.com',
			});

			const config = {
				method: 'post',
				url: this.configService.get<string>('AZURE_GET_ACCESS_TOKEN'),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				data: data,
			};

			const response = await axios(config);
			const token = response.data.access_token;

			return token;
		} catch (e) {
			return { status: false, error: e };
		}
	}

	async getUsers() {
		try {
			const accessToken = await this.getAccessToken();

			const config = {
				method: 'get',
				url: 'https://graph.microsoft.com/beta/users', // ?$select=id,displayName,email,extension_SegundoApellido',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			};
			const response = await axios(config);

			return response.data;
		} catch (e) {
			return { status: false, error: e };
		}
	}

	async setUserMongoId(oid: string, mongoId: string) {
		try {
			const accessToken = await this.getAccessToken();

			// Usar la variable de entorno para el nombre de la extensión, con un valor por defecto si no está definida
			const extensionName = this.configService.get<string>('AZURE_EXTENSION_MONGO_ID') || 'extension_7a19ff6e82e34ef39fa737833a382803_oid';

			// Crear un objeto dinámico para el payload
			const payload = {};
			payload[extensionName] = mongoId;

			const data = JSON.stringify(payload);

			const config = {
				method: 'patch',
				url: `https://graph.microsoft.com/v1.0/users/${oid}`,
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: '*/*',
					'Content-Type': 'application/json',
					'User-Agent': '*',
				},
				data: data,
			};

			const response = await axios(config);

			return response;
		} catch (error) {
			return { status: false, error: error };
		}
	}

	// no se pudo obtener por identitie, quedo implementado para obtener por ms_id
	async getUser(userId: string) {
		try {
			const accessToken = await this.getAccessToken();

			const config = {
				method: 'get',
				url: `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userId)}`,
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			};

			const response = await axios(config);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Axios error =====================> ', error.response?.data || error.message);
				throw new Error(`Error fetching user: ${error.response?.data?.error?.message || error.message}`);
			} else {
				console.error('Unexpected error =====================> ', error);
				throw new Error('Unexpected error occurred.');
			}
		}
	}

	// async sendEmail(senderId: string, mailOptions: SendEmailDto) {
	// 	try {
	// 		const accessToken = await this.getAccessToken();

	// 		if (!accessToken) {
	// 			throw new UnauthorizedException('No se pudo obtener el token de acceso');
	// 		}

	// 		const email = {
	// 			message: {
	// 				subject: mailOptions.subject,
	// 				body: {
	// 					contentType: 'HTML',
	// 					content: mailOptions.body,
	// 				},
	// 				toRecipients: mailOptions.to.map((email) => ({
	// 					emailAddress: {
	// 						address: email,
	// 					},
	// 				})),
	// 				attachments: mailOptions.attachments || [],
	// 			},
	// 			saveToSentItems: true,
	// 		};

	// 		const config = {
	// 			method: 'post',
	// 			url: `${this.graphUrl}/users/${encodeURIComponent(senderId)}/sendMail`,
	// 			headers: {
	// 				Authorization: `Bearer ${accessToken}`,
	// 				'Content-Type': 'application/json',
	// 			},
	// 			data: email,
	// 			timeout: 10000,
	// 		};

	// 		const response = await axios(config);
	// 		return response.data;
	// 	} catch (error) {
	// 		// Manejo específico de errores
	// 		if (error.response) {
	// 			switch (error.response.status) {
	// 				case 400:
	// 					throw new BadRequestException('Solicitud de correo inválida');
	// 				case 401:
	// 					console.error('Error de Microsoft Graph: ', error.response.data?.error);
	// 					throw new UnauthorizedException('Token inválido o expirado');
	// 				case 403:
	// 					throw new ForbiddenException('No tiene permisos para enviar correos');
	// 				case 404:
	// 					throw new NotFoundException(`Usuario ${senderId} no encontrado`);
	// 				default:
	// 					throw new InternalServerErrorException(`Error de Microsoft Graph: ${error.response.data?.message || error.message}`);
	// 			}
	// 		}

	// 		throw new InternalServerErrorException(`Error al enviar correo: ${error.message}`);
	// 	}
	// }

	// Método obsoleto - reemplazado por createB2CUser
	async setUser(): Promise<{ status: boolean; data: any; error: any }> {
		return { status: false, data: {}, error: 'Método no implementado' };
	}

	/**
	 * Crea un nuevo usuario en Azure B2C
	 * @param userData Datos del usuario a crear
	 * @returns Respuesta con el resultado de la operación
	 */
	async createB2CUser(userData: CreateB2CUserDTO): Promise<CreateB2CUserResponseDTO> {
		try {
			// Obtener token de acceso
			const accessToken = await this.getAccessToken();
			if (!accessToken || typeof accessToken !== 'string') {
				return {
					success: false,
					message: 'No se pudo obtener el token de acceso',
					error: accessToken,
				};
			}

			// Verificar si el usuario ya existe por email
			try {
				const existingUsers = await this.getUserByEmail(userData.email);
				if (existingUsers && existingUsers.value && existingUsers.value.length > 0) {
					return {
						success: false,
						message: 'Ya existe un usuario con este correo electrónico',
					};
				}
			} catch (error) {
				// Si hay un error al verificar, continuamos con la creación
				throw new Error(error);
			}

			// Preparar datos del usuario para Azure B2C
			// Asegurarse de que el dominio del tenant esté correctamente configurado
			const tenantDomain = this.configService.get<string>('AZURE_B2C_TENANT_DOMAIN') || 'cmusri.onmicrosoft.com';

			// Crear un ID único para el usuario
			const userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

			// Obtener los IDs de extensión desde variables de entorno
			const extensionSegundoApellido = this.configService.get<string>('AZURE_EXTENSION_SEGUNDO_APELLIDO');

			// Crear el objeto de usuario siguiendo exactamente la estructura de usuarios existentes en tu tenant
			const userData_ = {
				accountEnabled: true,
				displayName: `${userData.name} ${userData.fatherName} ${userData.motherName || ''}`.trim(),
				givenName: userData.name,
				surname: userData.fatherName,
				// Agregar el segundo apellido como extensión personalizada usando la variable de entorno
				...(userData.motherName && { [extensionSegundoApellido]: userData.motherName }),
				// Configurar identidades para inicio de sesión
				identities: [
					{
						signInType: 'emailAddress',
						issuer: tenantDomain,
						issuerAssignedId: userData.email,
					},
					{
						signInType: 'userPrincipalName',
						issuer: tenantDomain,
						issuerAssignedId: `${userId}@${tenantDomain}`,
					},
				],
				// Configurar nombre de usuario y UPN
				mailNickname: userId,
				userPrincipalName: `${userId}@${tenantDomain}`,
				// Configurar contraseña y obligar cambio en primer inicio de sesión
				passwordProfile: {
					password: userData.password,
					forceChangePasswordNextSignIn: true,
				},
				passwordPolicies: 'DisablePasswordExpiration',
			};

			// Intentar crear el usuario usando la API v1.0 que sabemos que funciona para otras operaciones
			const config = {
				method: 'post',
				url: 'https://graph.microsoft.com/v1.0/users',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: '*/*',
					'Content-Type': 'application/json',
					'User-Agent': '*',
				},
				data: JSON.stringify(userData_),
			};

			// Realizar la solicitud para crear el usuario
			const response = await axios(config);

			// Devolver respuesta exitosa
			return {
				success: true,
				message: 'Usuario creado correctamente en Azure B2C',
				userId: response.data.id,
			};
		} catch (error) {
			console.error('Error al crear usuario en Azure B2C:', error);
			// Manejar errores específicos
			if (axios.isAxiosError(error)) {
				const errorMessage = error.response?.data?.error?.message || error.message;
				return {
					success: false,
					message: `Error al crear usuario: ${errorMessage}`,
					error: error.response?.data,
				};
			}

			return {
				success: false,
				message: 'Error desconocido al crear usuario en Azure B2C',
				error: error,
			};
		}
	}

	/**
	 * Busca un usuario por su correo electrónico
	 * @param email Correo electrónico a buscar
	 * @returns Usuarios que coinciden con el correo
	 */
	async getUserByEmail(email: string) {
		try {
			const accessToken = await this.getAccessToken();
			if (!accessToken || typeof accessToken !== 'string') {
				throw new UnauthorizedException('No se pudo obtener el token de acceso');
			}

			// Asegurarse de que el dominio del tenant esté correctamente configurado
			const tenantDomain = this.configService.get<string>('AZURE_B2C_TENANT_DOMAIN') || 'cmusri.onmicrosoft.com';

			const config = {
				method: 'get',
				// Buscar usuarios por correo electrónico en las identidades (issuerAssignedId)
				url: `https://graph.microsoft.com/beta/users?$filter=identities/any(id:id/issuerAssignedId eq '${encodeURIComponent(email)}' and id/issuer eq '${tenantDomain}')`,
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			};

			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error('Error al buscar usuario por email:', error);
			if (axios.isAxiosError(error)) {
				throw new BadRequestException(`Error al buscar usuario: ${error.response?.data?.error?.message || error.message}`);
			}
			throw new InternalServerErrorException('Error desconocido al buscar usuario');
		}
	}
}
