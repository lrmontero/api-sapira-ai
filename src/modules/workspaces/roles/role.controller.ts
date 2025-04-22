import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiExcludeController, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { TokenInterceptor } from '@/interceptors/token.interceptor';
import { ValidateObjectIdPipe } from '@/pipes/validate-object-id.pipe';

import { ResponseDTO } from '../../response.dto';

import { CreateRoleDTO } from './dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { Role } from './schemas/role.schema';

@ApiExcludeController()
@ApiTags('Role')
@Controller('role')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor)
@ApiBearerAuth()
export class RoleController {
	constructor(private roleService: RoleService) {}

	// Obtener roles del sistema usuario autenticado
	@Get('/')
	@ApiOperation({
		summary: 'Obtener los roles del sistema',
		description: 'Este servicio retorna los roles del sistema',
	})
	@ApiOkResponse({ type: ResponseDTO<[Role]>, status: 200, description: 'Roles obtenidos exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getRoles(@Req() req, @Res() res): Promise<ResponseDTO<Role[]>> {
		try {
			const roles = await this.roleService.getRoles();
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Roles encontrados',
				data: roles,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Roles no encontrados para este usuario, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Post('/')
	@ApiOperation({
		summary: 'Crear un rol',
		description: 'Este servicio permite crear un rol',
	})
	@ApiBody({ type: CreateRoleDTO, required: true })
	@ApiOkResponse({ type: ResponseDTO<Role>, status: 200, description: 'Rol creado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async createRole(@Req() req, @Res() res, @Body() body: CreateRoleDTO): Promise<ResponseDTO<Role>> {
		const userId = req.user.extension_oid;

		try {
			const role = await this.roleService.createRole(userId, body);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Rol creado',
				data: role,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al crear rol, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Get('/:roleId')
	@ApiOperation({
		summary: 'Obtener rol por id',
		description: 'Este servicio retorna un rol a partir de su id',
	})
	@ApiParam({ name: 'roleId', required: true, type: String })
	@ApiOkResponse({ type: ResponseDTO<Role>, status: 200, description: 'Rol obtenidos exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getRole(@Req() req, @Res() res, @Param('roleId', new ValidateObjectIdPipe()) roleId: string): Promise<ResponseDTO<Role>> {
		const userId = req.user.extension_oid;
		try {
			const roles = await this.roleService.getRole(userId, roleId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Roles encontrados',
				data: roles,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Roles no encontrados para este usuario, favor contactar al administrador',
				error: error.message,
			});
		}
	}

	@Patch('/:roleId')
	@ApiOperation({
		summary: 'Editar un rol',
		description: 'Este servicio permite editar los roles',
	})
	@ApiBody({ type: UpdateRoleDTO, required: true })
	@ApiParam({ name: 'roleId', required: true, type: String })
	@ApiOkResponse({ type: ResponseDTO<Role>, status: 200, description: 'Roles obtenido exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Invalid operation' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async updateWorkspaceRoleDetail(
		@Req() req,
		@Res() res,
		@Param('roleId', new ValidateObjectIdPipe()) roleId: string,
		@Body() body: UpdateRoleDTO
	): Promise<ResponseDTO<Role>> {
		const userId = req.user.extension_oid;

		try {
			const role = await this.roleService.updateRoleDetail(userId, roleId, body);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Rol actualizado',
				data: role,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Problemas al actualizar rol, favor contactar al administrador',
				error: error.message,
			});
		}
	}
}
