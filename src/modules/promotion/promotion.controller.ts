import { Controller, Get, UseGuards, Res, HttpStatus, Patch, Param, Body } from '@nestjs/common';
import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { ApiBearerAuth, ApiBody, ApiExcludeController, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PromotionService } from './promotion.service';
import { ResponseDTO } from '@/modules/response.dto';
import { PromotionDTO } from './dto/promotion.dto';

@ApiExcludeController()
@ApiTags('Promotion')
@Controller('promotion')
@UseGuards(AzureADAuthGuard)
@ApiBearerAuth()
export class PromotionController {
	constructor(private readonly promotionService: PromotionService) {}

	@Get('/')
	@ApiOperation({ summary: 'Obtener tipos de publicación' })
	@ApiOkResponse({ type: ResponseDTO, description: 'Tipos de publicación encontrados' })
	async getRegions(@Res() res): Promise<ResponseDTO<PromotionDTO>> {
		try {
			const promotion = await this.promotionService.getPromotion();

			return res.status(HttpStatus.OK).json({
				status: HttpStatus.OK,
				message: 'Tipos de publicación encontrados',
				data: promotion,
			});
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Tipos de publicación no encontrados, favor contactar al administrador',
				error: error.message,
			});
		}
	}
}
