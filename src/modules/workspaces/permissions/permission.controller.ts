import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { TokenInterceptor } from '@/interceptors/token.interceptor';
import { ResponseDTO } from '@/modules/response.dto';

import { CreatePermissionDTO, MassiveUpdatePermissionsDTO, UpdatePermissionDTO, UpdatePermissionSequencesDto } from './dto';
import { PermissionService } from './permission.service';
import { Permission } from './schemas/permission.schema';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor)
@ApiBearerAuth()
export class PermissionController {
	constructor(private permissionService: PermissionService) {}

	// Obtener permisos del sistema
	@Get()
	@ApiOperation({
		summary: 'Obtener los permisos del sistema',
		description: 'Este servicio retorna los permisos del sistema',
	})
	@ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Permiso activo' })
	@ApiOkResponse({ type: ResponseDTO<Permission[]>, status: 200, description: 'Permisos obtenidos exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Operación inválida' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getPermissions(@Req() req, @Res() res, @Query('isActive') isActive?: string): Promise<ResponseDTO<Permission[]>> {
		const userId = req.user.extension_oid;
		try {
			// Convertir isActive a booleano si viene como string
			let isActiveBoolean: boolean | undefined = undefined;
			if (isActive !== undefined) {
				isActiveBoolean = isActive === 'true';
			}

			const permissions = await this.permissionService.getPermissions(userId, isActiveBoolean);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Permisos encontrados',
				data: permissions,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Error al obtener los permisos',
				error: error.message,
			});
		}
	}

	// Crear un nuevo permiso
	@Post()
	@ApiOperation({
		summary: 'Crear un nuevo permiso',
		description: 'Este servicio permite crear un nuevo permiso en el sistema',
	})
	@ApiBody({ type: CreatePermissionDTO, required: true })
	@ApiCreatedResponse({ type: ResponseDTO, status: 201, description: 'Permiso creado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Datos inválidos o permiso ya existe' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async createPermission(@Req() req, @Res() res, @Body() createPermissionDto: CreatePermissionDTO): Promise<ResponseDTO<Permission>> {
		const userId = req.user.extension_oid;

		try {
			const permission = await this.permissionService.createPermission(userId, createPermissionDto);
			return res.status(HttpStatus.CREATED).json({
				status: HttpStatus.CREATED,
				message: 'Permiso creado exitosamente',
				data: permission,
			});
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
			return res.status(status).json({
				status,
				message: error.message || 'Error al crear el permiso',
				error: error.message,
			});
		}
	}

	// Actualizar permisos del sistema
	@Patch()
	@ApiOperation({
		summary: 'Actualizar los permisos del sistema',
		description: 'Este servicio permite actualizar múltiples permisos del sistema',
	})
	@ApiBody({ type: [MassiveUpdatePermissionsDTO], required: true })
	@ApiOkResponse({ type: ResponseDTO<Permission[]>, status: 200, description: 'Permisos actualizados exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Operación inválida' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async massiveUpdatePermissions(@Req() req, @Res() res, @Body() body: MassiveUpdatePermissionsDTO[]): Promise<ResponseDTO<Permission[]>> {
		const userId = req.user.extension_oid;

		try {
			// Validar que el cuerpo de la solicitud no esté vacío
			if (!body || body.length === 0) {
				return res.status(HttpStatus.BAD_REQUEST).json({
					status: HttpStatus.BAD_REQUEST,
					message: 'No se proporcionaron permisos para actualizar',
				});
			}

			const permissions = await this.permissionService.massiveUpdatePermissions(userId, body);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Permisos actualizados exitosamente',
				data: permissions,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Error al actualizar los permisos',
				error: error.message,
			});
		}
	}

	// Actualizar un permiso específico
	@Patch(':id')
	@ApiOperation({
		summary: 'Actualizar un permiso',
		description: 'Este servicio permite actualizar un permiso específico por su ID',
	})
	@ApiBody({ type: UpdatePermissionDTO, required: true })
	@ApiOkResponse({ type: ResponseDTO, status: 200, description: 'Permiso actualizado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Datos inválidos o permiso ya existe' })
	@ApiBadRequestResponse({ status: 404, description: 'Permiso no encontrado' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async updatePermission(
		@Param('id') id: string,
		@Req() req,
		@Res() res,
		@Body() updatePermissionDto: UpdatePermissionDTO
	): Promise<ResponseDTO<Permission>> {
		const userId = req.user.extension_oid;

		try {
			const permission = await this.permissionService.updatePermission(id, userId, updatePermissionDto);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Permiso actualizado exitosamente',
				data: permission,
			});
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
			return res.status(status).json({
				status,
				message: error.message || 'Error al actualizar el permiso',
				error: error.message,
			});
		}
	}

	// Eliminar un permiso
	@Delete(':id')
	@ApiOperation({
		summary: 'Eliminar un permiso',
		description: 'Este servicio permite eliminar un permiso específico por su ID',
	})
	@ApiOkResponse({ type: ResponseDTO, status: 200, description: 'Permiso eliminado exitosamente' })
	@ApiBadRequestResponse({ status: 404, description: 'Permiso no encontrado' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async deletePermission(@Param('id') id: string, @Req() req, @Res() res): Promise<ResponseDTO<{ message: string }>> {
		try {
			const result = await this.permissionService.deletePermission(id);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: result.message,
				data: result,
			});
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
			return res.status(status).json({
				status,
				message: error.message || 'Error al eliminar el permiso',
				error: error.message,
			});
		}
	}

	// Ordenar permisos (formato alternativo)
	@Post('sequences')
	@ApiOperation({
		summary: 'Ordenar permisos (formato alternativo)',
		description: 'Este servicio permite ordenar los permisos actualizando su secuencia (formato alternativo)',
	})
	@ApiBody({
		description: 'Objeto con array de permisos con sus secuencias',
		type: UpdatePermissionSequencesDto,
	})
	@ApiOkResponse({ status: 200, description: 'Secuencias actualizadas exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Error en la validación de datos' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async orderPermissions(@Req() req, @Res() res, @Body() UpdatePermissionSequencesDto: UpdatePermissionSequencesDto) {
		const userId = req.user.extension_oid;

		try {
			const permissions = await this.permissionService.updatePermissionsSequences(userId, UpdatePermissionSequencesDto);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Permisos ordenados exitosamente',
				data: permissions,
			});
		} catch (error) {
			const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
			return res.status(status).json({
				status,
				message: error.message || 'Error al ordenar los permisos',
				error: error.message,
			});
		}
	}
}
