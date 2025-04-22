import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { TokenInterceptor } from '@/interceptors/token.interceptor';
import { ValidateObjectIdPipe } from '@/pipes/validate-object-id.pipe';

import { ResponseDTO } from '../response.dto';

import {
	CreateWorkspaceDTO,
	CreateWorkspaceUserDTO,
	CreateWorkspaceUserResponseDTO,
	InviteUserDTO,
	InviteUserResponseDTO,
	UpdateWorkspaceDTO,
} from './dto';
import { Role } from './roles/schemas/role.schema';
import { Workspace } from './schemas/workspace.schema';
import { UpdateUserTeamDTO } from './teams/dto/update-user-team.dto';
import { Team } from './teams/schemas/team.schema';
import { WorkspaceService } from './workspace.service';

// @ApiExcludeController()
@ApiTags('Workspace')
@Controller('workspace')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor)
@ApiBearerAuth()
export class WorkspaceController {
	constructor(private workspaceService: WorkspaceService) {}

	// Obtener workspaces del usuario autenticado
	@Get('/me')
	@ApiOperation({
		summary: 'Obtener los workspaces del usuario autenticado',
		description: 'Este servicio retorna los workspaces del usuario que esta autenticado',
	})
	@ApiOkResponse({ type: ResponseDTO<[Workspace]>, status: 200, description: 'Workspaces obtenidos exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getWorkspacesByUserId(@Req() req, @Res() res): Promise<ResponseDTO<Workspace[]>> {
		const userId = req.user.extension_oid;
		try {
			const workspaces = await this.workspaceService.getWorkspacesByUser(userId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspaces encontrados',
				data: workspaces,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Workspaces no encontrados para el usuario, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Obtener permisos del usuario en el workspace
	@Get('/me/:workspaceId/permissions')
	@ApiOperation({
		summary: 'Obtener permisos del usuario en el workspace',
		description: 'Obtener permisos del usuario en el workspace',
	})
	@ApiParam({ name: 'workspaceId', type: String, required: true })
	@ApiOkResponse({ type: ResponseDTO<[Permissions]>, status: 200, description: 'Workspace marcado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getMyWorkspacePermissions(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string
	): Promise<ResponseDTO<Permissions[]>> {
		const userId = req.user.extension_oid;
		try {
			const workspaces = await this.workspaceService.getMyWorkspacePermissions(userId, workspaceId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspace marcado exitosamente',
				data: workspaces,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problema al configurar workspace por defecto, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Marcar workspace por defecto
	@Patch('/me/:workspaceId/default')
	@ApiOperation({
		summary: 'Marcar un worspace como por defecto',
		description: 'Marcar un worspace como por defecto',
	})
	@ApiParam({ name: 'workspaceId', type: String, required: true })
	@ApiOkResponse({ type: ResponseDTO<[Workspace]>, status: 200, description: 'Workspace marcado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async setAsDefaultWorkspace(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string
	): Promise<ResponseDTO<Workspace[]>> {
		const userId = req.user.extension_oid;
		try {
			const workspaces = await this.workspaceService.setAsDefaultWorkspace(userId, workspaceId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspace marcado exitosamente',
				data: workspaces,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problema al configurar workspace por defecto, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Obtener un workspace por su id
	@Get('/:workspaceId')
	@ApiOperation({ summary: 'Obtener un workspace' })
	@ApiOkResponse({ type: ResponseDTO<[Workspace]>, description: 'Workspace encontrado' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getWorkspace(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string
	): Promise<ResponseDTO<Workspace[]>> {
		// const userId = req.user.extension_oid;
		// TODO: Validar si el usuario tiene permisos para acceder a la informacion del workspace

		try {
			const workspace: Workspace = await this.workspaceService.getWorkspace(workspaceId);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspace encontrado',
				data: workspace,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Workspace no encontrado, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Post()
	@ApiOperation({ summary: 'Crear un nuevo workspace' })
	@ApiBody({ type: CreateWorkspaceDTO, required: true })
	@ApiOkResponse({ type: Workspace, description: 'Workspace creado' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async addWorkspace(@Res() res, @Body() body): Promise<ResponseDTO<Workspace[]>> {
		try {
			const workspace: Workspace = await this.workspaceService.createWorkspace(body);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspace encontrado',
				data: workspace,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Workspace no encontrado, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Obtener el team de un workspace
	@Get('/:workspaceId/team')
	@ApiOperation({
		summary: 'Obtener el team de un workspace',
		description: 'Este servicio retorna los integrantes del team de un workspace',
	})
	@ApiParam({ name: 'workspaceId', required: true, type: String })
	@ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
	@ApiQuery({ name: 'page', required: false, type: String, description: 'Page number' })
	@ApiQuery({ name: 'limit', required: false, type: String, description: 'Limit of items per page' })
	@ApiOkResponse({ type: ResponseDTO<[Team]>, status: 200, description: 'Team obtenido exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getWorkspaceTeam(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Query('search') search?: string,
		@Query('page') page?: string,
		@Query('limit') limit?: string
	): Promise<ResponseDTO<{ members: Team[]; total: number; page: number; limit: number }>> {
		const userId = req.user.extension_oid;

		// Convertir los parámetros de consulta a números
		const pageNumber = page ? parseInt(page, 10) : 1;
		const limitNumber = limit ? parseInt(limit, 10) : 20;

		try {
			const teamData = await this.workspaceService.getWorkspaceTeam(userId, workspaceId, search || '', pageNumber, limitNumber);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Team encontrado',
				data: {
					members: teamData.members,
					total: teamData.total,
					page: teamData.page,
					limit: teamData.limit,
				},
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al obtener el team solicitado, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Obtener un miembro del team de un workspace
	@Get('/:workspaceId/team/:teamMemberId')
	@ApiOperation({
		summary: 'Obtener un miembro del team de un workspace',
		description: 'Este servicio retorna un miembro del team de un workspace',
	})
	@ApiParam({ name: 'workspaceId', required: true, type: String })
	@ApiParam({ name: 'teamMemberId', required: true, type: String })
	@ApiOkResponse({ type: ResponseDTO<Team>, status: 200, description: 'Team obtenido exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getWorkspaceTeamMember(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Param('teamMemberId', new ValidateObjectIdPipe()) teamMemberId: string
	): Promise<ResponseDTO<Team>> {
		const userId = req.user.extension_oid;

		try {
			const team = await this.workspaceService.getWorkspaceTeamMember(userId, workspaceId, teamMemberId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Team encontrado',
				data: team,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al obtener el team solicitado, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Patch('/:workspaceId/team/:teamMemberId')
	@ApiOperation({
		summary: 'Eliminar a un usuario del team de un workspace',
		description: 'Este servicio es para eliminar usuarios de un team de un workspace',
	})
	@ApiParam({ name: 'workspaceId', required: true, type: String })
	@ApiParam({ name: 'teamMemberId', required: true, type: String })
	@ApiOkResponse({ type: ResponseDTO<boolean>, status: 200, description: 'Usuario eliminado correctamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async updateWorkspaceTeamMember(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Param('teamMemberId', new ValidateObjectIdPipe()) teamMemberId: string,
		@Body() body: UpdateUserTeamDTO
	): Promise<ResponseDTO<boolean>> {
		const userId = req.user.extension_oid;
		try {
			const team = await this.workspaceService.updateWorkspaceTeamMember(userId, workspaceId, teamMemberId, body);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: '',
				data: team,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al actualizar el usuario del team, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Delete('/:workspaceId/team/:teamMemberId')
	@ApiOperation({
		summary: 'Eliminar a un usuario del equipo de un workspace',
		description:
			'Este servicio permite eliminar a un miembro específico del equipo de un workspace. Se requiere el ID del workspace y el ID del miembro del equipo a eliminar.',
	})
	@ApiParam({
		name: 'workspaceId',
		required: true,
		type: String,
		description: 'ID del workspace del que se eliminará el miembro',
		example: '6678c9f9f0cee7ab31e28aec',
	})
	@ApiParam({
		name: 'teamMemberId',
		required: true,
		type: String,
		description: 'ID del miembro del equipo a eliminar',
		example: '6678c9f9f0cee7ab31e28aed',
	})
	@ApiOkResponse({
		status: 200,
		description: 'Miembro del equipo eliminado correctamente',
		type: ResponseDTO,
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Usuario eliminado correctamente' },
				data: { type: 'boolean', example: true },
			},
		},
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Operación inválida o datos incorrectos',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 400 },
				message: { type: 'string', example: 'ID de workspace o miembro inválido' },
				error: { type: 'string' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({
		status: 500,
		description: 'Error interno del servidor',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 500 },
				message: { type: 'string', example: 'Problemas al eliminar el miembro del equipo, favor contactar al administrador' },
				error: { type: 'string' },
			},
		},
	})
	async deleteWorkspaceTeamMember(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Param('teamMemberId', new ValidateObjectIdPipe()) teamMemberId: string
	): Promise<ResponseDTO<{ success: boolean; message: string }>> {
		const userId = req.user.extension_oid;
		try {
			const result = await this.workspaceService.deleteWorkspaceTeamMember(userId, workspaceId, teamMemberId);

			if (result.success) {
				return res.status(HttpStatus.OK).json({
					status: HttpStatus.OK,
					message: 'Usuario eliminado del workspace exitosamente',
					data: {
						success: true,
						message: result.message,
					},
				});
			} else {
				return res.status(HttpStatus.BAD_REQUEST).json({
					status: HttpStatus.BAD_REQUEST,
					message: 'No se pudo eliminar el usuario del workspace',
					data: {
						success: false,
						message: result.message,
					},
				});
			}
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Error al eliminar el usuario del workspace',
				error: error.message,
				data: {
					success: false,
					message: 'Ocurrió un error al procesar la solicitud',
				},
			});
		}
	}

	// Invitar a un usuario al team de un workspace
	@Post('/:workspaceId/team/invite')
	@ApiOperation({
		summary: 'Invitar a un usuario al equipo de un workspace',
		description:
			'Este servicio permite invitar a un usuario a formar parte del equipo de un workspace específico. Se busca al usuario por su correo electrónico y se verifica que no pertenezca ya al equipo.',
	})
	@ApiParam({
		name: 'workspaceId',
		required: true,
		type: String,
		description: 'ID del workspace al que se invitará al usuario',
		example: '6678c9f9f0cee7ab31e28aec',
	})
	@ApiBody({
		type: InviteUserDTO,
		required: true,
		description: 'Datos del usuario a invitar',
		examples: {
			ejemplo: {
				value: {
					email: 'usuario@ejemplo.com',
				},
				summary: 'Invitación por correo electrónico',
			},
		},
	})
	@ApiOkResponse({
		status: 200,
		description: 'Usuario invitado correctamente al equipo del workspace',
		type: ResponseDTO,
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Incorporación de usuario procesada correctamente' },
				data: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						message: { type: 'string', example: 'Usuario añadido correctamente al Equipo' },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Operación inválida o datos incorrectos',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 400 },
				message: { type: 'string', example: 'El correo electrónico es requerido' },
				error: { type: 'string' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({
		status: 500,
		description: 'Error interno del servidor',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 500 },
				message: { type: 'string', example: 'Incorporación de usuario con problemas, favor contactar al administrador' },
				error: { type: 'string' },
			},
		},
	})
	async inviteUser(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Body() body
	): Promise<ResponseDTO<InviteUserResponseDTO>> {
		const userId = req.user.extension_oid;
		try {
			const result: InviteUserResponseDTO = await this.workspaceService.inviteUser(userId, workspaceId, body);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Incorporación de usuario procesada correctamente',
				data: result,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Incorporación de usuario con problemas, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Post('/:workspaceId/team/create-user')
	@ApiOperation({
		summary: 'Crear usuario en un workspace',
		description: 'Este servicio permite crear un usuario en Azure B2C y agregarlo a un workspace',
	})
	@ApiParam({ name: 'workspaceId', type: String, required: true })
	@ApiBody({ type: CreateWorkspaceUserDTO })
	@ApiOkResponse({
		status: 200,
		description: 'Usuario creado correctamente en el workspace',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Usuario creado correctamente en el workspace' },
				data: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						message: { type: 'string', example: 'Usuario creado y agregado al workspace correctamente' },
						userId: { type: 'string', example: '00000000-0000-0000-0000-000000000000' },
						profileId: { type: 'string', example: '62d5bdbf9e98226c45433833' },
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
				message: { type: 'string', example: 'El usuario ya es miembro de este workspace' },
				error: { type: 'object' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({ status: 500, description: 'Error interno del servidor' })
	async createWorkspaceUser(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Body() userData: CreateWorkspaceUserDTO
	): Promise<ResponseDTO<CreateWorkspaceUserResponseDTO>> {
		const userId = req.user.extension_oid;
		try {
			const result = await this.workspaceService.createWorkspaceUser(userId, workspaceId, userData);

			if (result.success) {
				return res.status(HttpStatus.OK).json({
					status: HttpStatus.OK,
					message: 'Usuario creado correctamente en el workspace',
					data: result,
				});
			} else {
				return res.status(HttpStatus.BAD_REQUEST).json({
					status: HttpStatus.BAD_REQUEST,
					message: result.message || 'Error al crear usuario en el workspace',
					error: result.error,
				});
			}
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Error al crear usuario en el workspace',
				error: error.message,
			});
		}
	}

	// Obtener los roles de un workspace
	@Get('/:workspaceId/roles')
	@ApiOperation({
		summary: 'Obtener los roles de un workspace',
		description: 'Este servicio retorna todos los roles que tiene configurado un workspace.',
	})
	@ApiParam({
		name: 'workspaceId',
		required: true,
		type: String,
		description: 'ID del workspace del que se obtendrán los roles',
		example: '6678c9f9f0cee7ab31e28aec',
	})
	@ApiOkResponse({
		status: 200,
		description: 'Roles obtenidos exitosamente',
		type: ResponseDTO,
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Roles encontrado' },
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							_id: { type: 'string', example: '6678c9f9f0cee7ab31e28aec' },
							name: { type: 'string', example: 'Administrador' },
							code: { type: 'string', example: 'ADMIN' },
							description: { type: 'string', example: 'Rol con acceso completo al sistema' },
							isActive: { type: 'boolean', example: true },
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Operación inválida o datos incorrectos',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 400 },
				message: { type: 'string', example: 'ID de workspace inválido' },
				error: { type: 'string' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({
		status: 500,
		description: 'Error interno del servidor',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 500 },
				message: { type: 'string', example: 'Problemas al obtener los roles del workspace solicitado, favor contactar al administrador' },
				error: { type: 'string' },
			},
		},
	})
	async getWorkspaceRoles(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string
	): Promise<ResponseDTO<Role[]>> {
		const userId = req.user.extension_oid;

		try {
			const roles = await this.workspaceService.getWorkspaceRoles(userId, workspaceId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Roles encontrado',
				data: roles,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al obtener los roles del workspace solicitado, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Crear un rol en un workspace
	@Post('/:workspaceId/roles')
	@ApiOperation({
		summary: 'Crear un rol en un workspace',
		description: 'Este servicio permite crear un nuevo rol personalizado en un workspace. Solo los dueños del workspace pueden crear roles.',
	})
	@ApiParam({
		name: 'workspaceId',
		required: true,
		type: String,
		description: 'ID del workspace donde se creará el rol',
		example: '6678c9f9f0cee7ab31e28aec',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				name: { type: 'string', example: 'Editor de Contenido', description: 'Nombre descriptivo del rol' },
				code: { type: 'string', example: 'EDITOR', description: 'Código único para identificar el rol' },
				description: {
					type: 'string',
					example: 'Rol para usuarios que pueden editar contenido pero no administrar usuarios',
					description: 'Descripción detallada del propósito del rol',
				},
				isActive: { type: 'boolean', example: true, description: 'Indica si el rol está activo y disponible para asignar' },
				permissions: {
					type: 'array',
					items: { type: 'string' },
					example: ['READ_CONTENT', 'EDIT_CONTENT'],
					description: 'Lista de permisos asignados al rol',
				},
			},
			required: ['name', 'code'],
		},
	})
	@ApiOkResponse({
		status: 200,
		description: 'Rol creado exitosamente',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Rol creado correctamente' },
				data: {
					type: 'object',
					properties: {
						_id: { type: 'string', example: '6678c9f9f0cee7ab31e28aec' },
						name: { type: 'string', example: 'Editor de Contenido' },
						code: { type: 'string', example: 'EDITOR' },
						description: { type: 'string', example: 'Rol para usuarios que pueden editar contenido pero no administrar usuarios' },
						isActive: { type: 'boolean', example: true },
						permissions: { type: 'array', items: { type: 'string' }, example: ['READ_CONTENT', 'EDIT_CONTENT'] },
						createdAt: { type: 'string', example: '2025-04-06T14:40:16.000Z' },
						updatedAt: { type: 'string', example: '2025-04-06T14:40:16.000Z' },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Operación inválida o datos incorrectos',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 400 },
				message: { type: 'string', example: 'No se pudo crear el rol' },
				error: { type: 'string', example: 'El código del rol ya existe' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({ status: 403, description: 'No tienes permisos para crear roles en este workspace' })
	async createWorkspaceRole(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Body() roleData: any
	): Promise<ResponseDTO<Role>> {
		const userId = req.user.extension_oid;

		try {
			const newRole = await this.workspaceService.createWorkspaceRole(userId, workspaceId, roleData);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Rol creado correctamente',
				data: newRole,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al crear el rol en el workspace, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Editar un rol de un workspace
	@Patch('/:workspaceId/roles/:roleId')
	@ApiOperation({
		summary: 'Editar un rol en un workspace',
		description: 'Este servicio permite editar un rol existente en un workspace. Solo los dueños del workspace pueden editar roles.',
	})
	@ApiParam({
		name: 'workspaceId',
		required: true,
		type: String,
		description: 'ID del workspace donde se editará el rol',
		example: '6678c9f9f0cee7ab31e28aec',
	})
	@ApiParam({
		name: 'roleId',
		required: true,
		type: String,
		description: 'ID del rol que se va a editar',
		example: '6678c9f9f0cee7ab31e28aed',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				name: { type: 'string', example: 'Editor de Contenido Actualizado', description: 'Nombre descriptivo del rol' },
				code: { type: 'string', example: 'EDITOR_V2', description: 'Código único para identificar el rol' },
				description: {
					type: 'string',
					example: 'Rol actualizado para usuarios que pueden editar contenido pero no administrar usuarios',
					description: 'Descripción detallada del propósito del rol',
				},
				isActive: { type: 'boolean', example: true, description: 'Indica si el rol está activo y disponible para asignar' },
				permissions: {
					type: 'array',
					items: { type: 'string' },
					example: ['READ_CONTENT', 'EDIT_CONTENT', 'DELETE_CONTENT'],
					description: 'Lista de permisos asignados al rol',
				},
			},
		},
	})
	@ApiOkResponse({
		status: 200,
		description: 'Rol editado exitosamente',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 200 },
				message: { type: 'string', example: 'Rol editado correctamente' },
				data: {
					type: 'object',
					properties: {
						_id: { type: 'string', example: '6678c9f9f0cee7ab31e28aed' },
						name: { type: 'string', example: 'Editor de Contenido Actualizado' },
						code: { type: 'string', example: 'EDITOR_V2' },
						description: {
							type: 'string',
							example: 'Rol actualizado para usuarios que pueden editar contenido pero no administrar usuarios',
						},
						isActive: { type: 'boolean', example: true },
						permissions: { type: 'array', items: { type: 'string' }, example: ['READ_CONTENT', 'EDIT_CONTENT', 'DELETE_CONTENT'] },
						createdAt: { type: 'string', example: '2025-04-06T14:40:16.000Z' },
						updatedAt: { type: 'string', example: '2025-04-07T10:15:22.000Z' },
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		status: 400,
		description: 'Operación inválida o datos incorrectos',
		schema: {
			type: 'object',
			properties: {
				status: { type: 'number', example: 400 },
				message: { type: 'string', example: 'No se pudo editar el rol' },
				error: { type: 'string', example: 'El código del rol ya existe' },
			},
		},
	})
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido o sin autorización' })
	@ApiBadRequestResponse({ status: 403, description: 'No tienes permisos para editar roles en este workspace' })
	async editRoleWorkspace(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Param('roleId', new ValidateObjectIdPipe()) roleId: string,
		@Body() roleData: any
	): Promise<ResponseDTO<boolean>> {
		const userId = req.user.extension_oid;

		try {
			const updatedRole = await this.workspaceService.editWorkspaceRole(userId, workspaceId, roleId, roleData);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Rol editado correctamente',
				data: updatedRole,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al editar el rol en el workspace, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Eliminar un rol de un workspace
	@Delete('/:workspaceId/roles/:roleId')
	@ApiOperation({
		summary: 'Eliminar un rol a un workspace',
		description: 'Este servicio permite eliminar un rol de un workspace',
	})
	@ApiParam({ name: 'workspaceId', required: true, type: String })
	@ApiParam({ name: 'roleId', required: true, type: String })
	@ApiOkResponse({ type: ResponseDTO<boolean>, status: 200, description: 'Roles obtenido exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async deleteWorkspaceRole(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Param('roleId', new ValidateObjectIdPipe()) roleId: string
	): Promise<ResponseDTO<boolean>> {
		const userId = req.user.extension_oid;

		try {
			const deletedRole = await this.workspaceService.deleteWorkspaceRole(userId, workspaceId, roleId);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Rol eliminado correctamente',
				data: deletedRole,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al agregar el rol al workspace, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// TODO. Verificar si se utiliza - Obtener el team de un workspace
	@Get('/:workspaceId/roles/:roleId')
	@ApiOperation({
		summary: 'Obtener los roles de un workspace',
		description: 'Este servicio retorna los roles que tiene configurado un workspace',
	})
	@ApiParam({ name: 'workspaceId', required: true, type: String })
	@ApiParam({ name: 'roleId', required: true, type: String })
	@ApiOkResponse({ type: ResponseDTO<Role>, status: 200, description: 'Roles obtenido exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getWorkspaceRoleDetail(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string,
		@Param('roleId', new ValidateObjectIdPipe()) roleId: string
	): Promise<ResponseDTO<Role>> {
		const userId = req.user.extension_oid;

		try {
			const role = await this.workspaceService.getWorkspaceRoleDetail(userId, workspaceId, roleId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Role encontrado',
				data: role,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al obtener el solicitado, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	// Actualizar atributos de un workspace
	@Patch('/:workspaceId')
	@ApiOperation({
		summary: 'Actualizar atributos de un workspace',
		description: 'Este servicio permite actualizar los atributos de un workspace específico',
	})
	@ApiParam({ name: 'workspaceId', type: String, required: true })
	@ApiBody({ type: UpdateWorkspaceDTO })
	@ApiOkResponse({ type: ResponseDTO<Workspace>, status: 200, description: 'Workspace actualizado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async updateWorkspace(
		@Param('workspaceId', ValidateObjectIdPipe) workspaceId: string,
		@Body() updateData: UpdateWorkspaceDTO,
		@Res() res
	): Promise<ResponseDTO<Workspace>> {
		try {
			const workspace = await this.workspaceService.updateWorkspace(workspaceId, updateData);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspace actualizado exitosamente',
				data: workspace,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Error al actualizar el workspace',
				error: error.message,
			});
		}
	}

	// Eliminar un workspace
	@Delete(':workspaceId')
	@ApiOperation({
		summary: 'Eliminar un workspace',
		description:
			'Este servicio permite eliminar un workspace específico. No se puede eliminar un workspace por defecto o que tenga usuarios activos.',
	})
	@ApiParam({ name: 'workspaceId', type: String, required: true })
	@ApiOkResponse({ type: ResponseDTO<boolean>, status: 200, description: 'Workspace eliminado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async deleteWorkspace(@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string, @Res() res): Promise<ResponseDTO<boolean>> {
		try {
			await this.workspaceService.deleteWorkspace(workspaceId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Workspace eliminado exitosamente',
				data: true,
			});
		} catch (error) {
			return res.status(HttpStatus.BAD_REQUEST).json({
				status: HttpStatus.BAD_REQUEST,
				message: error.message,
				error: error.message,
			});
		}
	}
}
