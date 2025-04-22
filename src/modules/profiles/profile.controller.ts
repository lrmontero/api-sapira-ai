import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	NotFoundException,
	Param,
	Patch,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { TokenInterceptor } from '@/interceptors/token.interceptor';
import { ValidateObjectIdPipe } from '@/pipes/validate-object-id.pipe';
import { ValidateImagePipe } from '@/pipes/validate-property-image.pipe';

import { ResponseDTO } from '../response.dto';

import { CreateUserDTO, UpdateUserDTO } from './dtos';
import { ProfileService } from './profile.service';
import { User } from './schemas/profile.schema';

// @ApiExcludeController()
@ApiTags('Profile')
@Controller('profile')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor)
@ApiBearerAuth()
export class ProfileController {
	constructor(private profileService: ProfileService) {}

	// Obtener perfil del usuario a partir del email
	@Get('/login')
	@ApiOperation({ summary: 'Obtener data del usuario al momento del login' })
	@ApiOkResponse({ type: ResponseDTO<[User]>, description: 'Usuario encontrado' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getUser(@Req() req, @Res() res): Promise<ResponseDTO<User[]>> {
		const userId = req.user.extension_oid;

		try {
			const user = await this.profileService.getProfile(userId);

			res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuario encontrado',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al obtener el usuario solicitado, favor contactar al administrador',
				data: error.message,
			});
		}
	}

	// Obtener perfil del usuario autenticado
	@Get('/me')
	@ApiOperation({ summary: 'Obtiene perfil del usuario autenticado' })
	@ApiOkResponse({ type: ResponseDTO<[User]>, description: 'Usuario encontrado' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getProfile(@Req() req, @Res() res): Promise<ResponseDTO<User[]>> {
		try {
			const userId = req.user.extension_oid;
			const user = await this.profileService.getProfile(userId);
			if (!user) throw new NotFoundException('El usuario no existe');
			res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuario encontrado',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al obtener el usuario solicitado, favor contactar al administrador',
				data: error.message,
			});
		}
	}

	// Actualizar información del perfil del usuario autenticado
	@Patch('/me')
	@ApiOperation({ summary: 'Actualizar información del perfil del usuario autenticado' })
	@ApiBody({ type: UpdateUserDTO, required: true, description: 'Objeto para editar un usuario' })
	@ApiOkResponse({ type: ResponseDTO<[User]>, description: 'Usuario actualizada' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async updatePropertyBasicInfo(@Req() req, @Res() res, @Body() userData: UpdateUserDTO): Promise<ResponseDTO<User[]>> {
		try {
			const userId = req.user.extension_oid;
			const user = await this.profileService.updateUser(userId, userData);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuario actualizado exitosamente',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al actualizar la data del usuario, favor contactar al administrador',
				data: error.message,
			});
		}
	}

	// Cargar imagen de perfil del usuario autenticado
	@Post('/image/upload/me')
	@ApiConsumes('multipart/form-data')
	@ApiParam({ name: 'userId', type: 'string', description: 'ID of the user' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@UseInterceptors(FileInterceptor('file'), new ValidateImagePipe())
	async uploadFile(@Req() req, @Res() res, @UploadedFile() file: Express.Multer.File) {
		try {
			const userId = req.user.extension_oid;
			const url = await this.profileService.uploadProfileImage(userId, file);

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Imagen guardada exitosamente',
				data: url,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: `Hubo un error al actualizar la imagen de perfil, favor contactar al administrador -> ${error}`,
				data: error.message,
			});
		}
	}

	// Marcar workspace por defecto
	@Patch('/default-workspace/:workspaceId')
	@ApiOperation({ summary: 'Actualizar workspace por defecto del usuario autenticado' })
	@ApiParam({ name: 'workspaceId', type: String, required: true })
	@ApiOkResponse({ type: ResponseDTO<[User]>, description: 'Usuario actualizado' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async setDefaultWorkspace(
		@Req() req,
		@Res() res,
		@Param('workspaceId', new ValidateObjectIdPipe()) workspaceId: string
	): Promise<ResponseDTO<User[]>> {
		try {
			const userId = req.user.extension_oid;
			const user = await this.profileService.setDefaultWorkspace(userId, workspaceId);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuario actualizado exitosamente',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al actualizar la data del usuario, favor contactar al administrador',
				data: error.message,
			});
		}
	}

	/** NO ESTAN EN USO DESDE EL FRONT */

	// Crear Usuario
	@Post('/create')
	@ApiOperation({ summary: 'Crear un nuevo usuario' })
	@ApiBody({ type: CreateUserDTO, required: true, description: 'Objeto para crear un usuario' })
	@ApiOkResponse({ type: User, description: 'Usuario creado exitosamente' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async createUser(@Res() res, @Body() userData: CreateUserDTO) {
		try {
			const user: User = await this.profileService.createUser(userData);
			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuario creado exitosamente',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al crear al usuario, favor contactar al administrador',
				data: error.message,
			});
		}
	}

	// Obtener listado de usuarios del sistema
	@Get()
	@ApiOperation({ summary: 'Obtener listado de usuarios' })
	@ApiOkResponse({ type: [User], description: 'Usuarios encontrados' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async getProperties(@Res() res) {
		try {
			const users: User[] = await this.profileService.getUsers();
			res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuarios encontrados',
				data: users,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al obtener el listado de usuarios, favor contactar al administrador',
				data: error.message,
			});
		}
	}

	// Eliminar usuarios por id
	@Delete('/:userId/delete')
	@ApiOperation({ summary: 'Eliminar un usuario' })
	@ApiOkResponse({ type: User, description: 'Usuario eliminado' })
	@ApiBadRequestResponse({ status: 400, description: 'Requerimiento con problemas, revisar valores enviados en la solicitud' })
	@ApiBadRequestResponse({ status: 401, description: 'Token inválido' })
	async deleteProperty(@Res() res, @Param('userId', new ValidateObjectIdPipe()) userId: string) {
		try {
			const user = await this.profileService.deleteUser(userId);
			if (!user) throw new NotFoundException('El usuario no existe');
			res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Usuario eliminado',
				data: user,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Hubo un error al eliminar el usuario, favor contactar al administrador',
				data: error.message,
			});
		}
	}
}
