import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AzureADAuthGuard } from '@/auth/strategies/azuread-auth.guard';
import { Public } from '@/decorators/public.decorator';
import { TokenInterceptor } from '@/interceptors/token.interceptor';

import { SyncInvoicesDTO } from './odoo.dto';
import { OdooService } from './odoo.service';

@ApiTags('Odoo')
@Controller('odoo')
@UseGuards(AzureADAuthGuard)
@UseInterceptors(TokenInterceptor)
export class OdooController {
	constructor(private readonly odooService: OdooService) {}

	@Post('sync-invoices')
	@ApiOperation({
		summary: 'Sincronizar facturas desde Odoo',
		description: 'Sincroniza facturas y líneas de factura desde Odoo con filtros opcionales de fecha y paginación',
	})
	@ApiBody({ type: SyncInvoicesDTO, required: true, description: 'Parámetros para sincronización de facturas' })
	@ApiOkResponse({ description: 'Sincronización exitosa' })
	@ApiBadRequestResponse({ description: 'Parámetros inválidos' })
	@Public()
	async syncInvoices(@Body() syncData: SyncInvoicesDTO): Promise<any> {
		return await this.odooService.syncInvoices(syncData);
	}
}
