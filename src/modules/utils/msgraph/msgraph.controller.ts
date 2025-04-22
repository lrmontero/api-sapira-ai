import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiExcludeController, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { TokenInterceptor } from '@/interceptors/token.interceptor';
import { ResponseDTO } from '@/modules/response.dto';

import { CreateB2CUserDTO, CreateB2CUserResponseDTO } from './dto/create-b2c-user.dto';
import { MSGraphService } from './msgraph.service';

@ApiExcludeController()
@ApiTags('MSGraph')
@Controller('msgraph')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor)
@ApiBearerAuth()
@ApiOkResponse({ type: ResponseDTO, description: 'Operación exitosa' })
@ApiBadRequestResponse({ description: 'Solicitud inválida o datos incorrectos' })
export class MSGraphController {
	constructor(private msgraphService: MSGraphService) {}

	@Get('/token')
	@ApiOperation({
		summary: 'Obtener Token de MSGraph',
		description:
			'Obtiene un token de acceso para la API de Microsoft Graph. Este token es necesario para realizar operaciones con la API de Microsoft Graph.',
	})
	@ApiOkResponse({
		status: 200,
		description: 'Token obtenido correctamente',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Token obtenido' },
				data: { type: 'string', example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 400, description: 'Operación inválida o parámetros incorrectos' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	async getAccessToken(@Res() res): Promise<ResponseDTO<any>> {
		try {
			const token = await this.msgraphService.getAccessToken();

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Token obtenido',
				data: token,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problema al obtener token, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Get('/users')
	@ApiOperation({
		summary: 'Obtener todos los usuarios del tenant',
		description: 'Recupera la lista completa de usuarios registrados en el directorio de Azure AD B2C del tenant.',
	})
	@ApiOkResponse({
		status: 200,
		description: 'Lista de usuarios obtenida correctamente',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Usuarios obtenidos' },
				data: {
					type: 'object',
					properties: {
						value: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'string', example: '00000000-0000-0000-0000-000000000000' },
									displayName: { type: 'string', example: 'Juan Pérez González' },
									givenName: { type: 'string', example: 'Juan' },
									surname: { type: 'string', example: 'Pérez' },
									userPrincipalName: { type: 'string', example: 'juan.perez@ejemplo.com' },
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({ status: 400, description: 'Operación inválida o parámetros incorrectos' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	async getMSGraphUsers(@Res() res): Promise<ResponseDTO<any>> {
		try {
			const users = await this.msgraphService.getUsers();

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuarios obtenidos',
				data: users,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problema al obtener usuarios, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Get('/user-id/:userId')
	@ApiOperation({
		summary: 'Obtener información de un usuario específico',
		description: 'Recupera la información detallada de un usuario específico a partir de su ID o identificador único en Azure AD B2C.',
	})
	@ApiParam({
		name: 'userId',
		type: 'string',
		description: 'ID o identificador único del usuario en Azure AD B2C',
		example: '00000000-0000-0000-0000-000000000000',
	})
	@ApiOkResponse({
		status: 200,
		description: 'Información del usuario obtenida correctamente',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Id obtenido' },
				data: {
					type: 'object',
					properties: {
						id: { type: 'string', example: '00000000-0000-0000-0000-000000000000' },
						displayName: { type: 'string', example: 'Juan Pérez González' },
						givenName: { type: 'string', example: 'Juan' },
						surname: { type: 'string', example: 'Pérez' },
						userPrincipalName: { type: 'string', example: 'juan.perez@ejemplo.com' },
						identities: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									signInType: { type: 'string', example: 'emailAddress' },
									issuer: { type: 'string', example: 'contoso.onmicrosoft.com' },
									issuerAssignedId: { type: 'string', example: 'juan.perez@ejemplo.com' },
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({ status: 400, description: 'Operación inválida o ID de usuario incorrecto' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({ status: 404, description: 'Usuario no encontrado' })
	async getUserId(@Param('userId') userId: string, @Res() res): Promise<ResponseDTO<any>> {
		try {
			const user = await this.msgraphService.getUser(userId);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Id obtenido',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problema al obtener el usuario, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Post('/create-b2c-user')
	@ApiOperation({
		summary: 'Crear un nuevo usuario en Azure B2C',
		description:
			'Crea un nuevo usuario en el directorio de Azure AD B2C con los datos proporcionados. Verifica previamente si ya existe un usuario con el mismo correo electrónico.',
	})
	@ApiBody({
		type: CreateB2CUserDTO,
		required: true,
		description: 'Datos del usuario a crear en Azure B2C',
		examples: {
			usuarioCompleto: {
				summary: 'Usuario con todos los datos',
				value: {
					name: 'Juan',
					fatherName: 'Pérez',
					motherName: 'González',
					email: 'juan.perez@ejemplo.com',
					password: 'Contraseña123!',
				},
			},
			usuarioSinApellidoMaterno: {
				summary: 'Usuario sin apellido materno',
				value: {
					name: 'María',
					fatherName: 'López',
					email: 'maria.lopez@ejemplo.com',
					password: 'Contraseña123!',
				},
			},
		},
	})
	@ApiOkResponse({
		status: 200,
		description: 'Usuario creado correctamente en Azure B2C',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Usuario creado correctamente en Azure B2C' },
				data: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						message: { type: 'string', example: 'Usuario creado correctamente en Azure B2C' },
						userId: { type: 'string', example: '00000000-0000-0000-0000-000000000000' },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Datos inválidos o usuario ya existente',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 400 },
				message: { type: 'string', example: 'Ya existe un usuario con este correo electrónico' },
				error: { type: 'object' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({ status: 500, description: 'Error interno del servidor' })
	async createB2CUser(@Body() userData: CreateB2CUserDTO, @Res() res): Promise<ResponseDTO<CreateB2CUserResponseDTO>> {
		try {
			const result = await this.msgraphService.createB2CUser(userData);

			if (result.success) {
				return res.status(HttpStatus.OK).json({
					status: HttpStatus.OK,
					message: 'Usuario creado correctamente en Azure B2C',
					data: result,
				});
			} else {
				return res.status(HttpStatus.BAD_REQUEST).json({
					status: HttpStatus.BAD_REQUEST,
					message: result.message || 'Error al crear usuario en Azure B2C',
					error: result.error,
				});
			}
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Error al crear usuario en Azure B2C',
				error: error.message,
			});
		}
	}

	// @Post('send-email/:senderId')
	// @ApiOperation({ summary: 'Enviar correo electrónico' })
	// @ApiParam({
	// 	name: 'senderId',
	// 	type: 'string',
	// 	description: 'ID o email del usuario que envía el correo',
	// 	example: 'user@domain.com',
	// })
	// @ApiBody({ type: SendEmailDto })
	// @ApiResponse({ status: 200, description: 'Correo enviado exitosamente' })
	// @ApiResponse({ status: 400, description: 'Solicitud inválida' })
	// @ApiResponse({ status: 401, description: 'No autorizado' })
	// @ApiResponse({ status: 500, description: 'Error interno del servidor' })
	// async sendEmail(@Param('senderId') senderId: string, @Body() mailData: SendEmailDto, @Res() res) {
	// 	try {
	// 		// Validar senderId
	// 		if (!senderId) {
	// 			return res.status(HttpStatus.BAD_REQUEST).json({
	// 				status: HttpStatus.BAD_REQUEST,
	// 				message: 'Se requiere el ID del remitente',
	// 				error: 'Sender ID is required',
	// 			});
	// 		}

	// 		const result = await this.msgraphService.sendEmail(senderId, mailData);

	// 		return res.status(HttpStatus.OK).json({
	// 			status: HttpStatus.OK,
	// 			message: 'Correo enviado exitosamente',
	// 			data: result,
	// 		});
	// 	} catch (error) {
	// 		// Manejo específico según el tipo de error
	// 		if (error instanceof UnauthorizedException) {
	// 			return res.status(HttpStatus.UNAUTHORIZED).json({
	// 				status: HttpStatus.UNAUTHORIZED,
	// 				message: 'No autorizado',
	// 				error: error.message,
	// 			});
	// 		}

	// 		if (error instanceof BadRequestException) {
	// 			return res.status(HttpStatus.BAD_REQUEST).json({
	// 				status: HttpStatus.BAD_REQUEST,
	// 				message: 'Solicitud inválida',
	// 				error: error.message,
	// 			});
	// 		}

	// 		return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
	// 			status: HttpStatus.INTERNAL_SERVER_ERROR,
	// 			message: 'Error al enviar el correo',
	// 			error: error.message,
	// 		});
	// 	}
	// }
}
