import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
	constructor(private readonly configService: ConfigService) {}

	/**
	 * Genera un token JWT con los permisos del usuario
	 * @param userId ID del usuario
	 * @param workspaceId ID del workspace
	 * @param permissions Permisos del usuario
	 * @returns Token JWT firmado
	 */
	generatePermissionsToken(userId: string, workspaceId: string, permissions: any[]): string {
		const payload = {
			sub: userId,
			workspaceId,
			permissions: permissions.map((p) => p.code),
			type: 'permissions',
		};

		const secret = this.configService.get<string>('security.jwt.secret') || 'default-secret-key';
		const expiresIn = this.configService.get<string>('security.jwt.expiresIn') || '1h';

		// Usar el secreto directamente como string, pero con el tipo correcto
		return jwt.sign(payload, secret as jwt.Secret, { expiresIn } as SignOptions);
	}

	/**
	 * Verifica y decodifica un token JWT
	 * @param token Token JWT a verificar
	 * @returns Payload decodificado o null si el token es inválido
	 */
	verifyToken(token: string): any {
		try {
			const secret = this.configService.get<string>('security.jwt.secret') || 'default-secret-key';
			// Usar el secreto directamente como string, pero con el tipo correcto
			return jwt.verify(token, secret as jwt.Secret);
		} catch (error) {
			return null;
		}
	}
}
