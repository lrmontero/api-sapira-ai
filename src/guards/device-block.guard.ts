import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

import { DevicesService } from '@/modules/devices/devices.service';

@Injectable()
export class DeviceBlockGuard implements CanActivate {
	constructor(private readonly devicesService: DevicesService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		// Verificar si hay información del dispositivo
		if (!request.deviceInfo || !request.deviceInfo.deviceId) {
			return true; // Si no hay información de dispositivo, permitir el acceso
		}

		// Verificar si el dispositivo está bloqueado
		const isBlocked = await this.devicesService.isDeviceBlocked(request.deviceInfo.deviceId);

		if (isBlocked) {
			throw new HttpException('Este dispositivo ha sido bloqueado. Por favor, contacte al administrador.', HttpStatus.FORBIDDEN);
		}

		return true;
	}
}
