import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
	private readonly cipher_iv: string = 'gqLOHUioQ0QjhuvI';
	private readonly cipher_password_hash: string = 'a8aeb7ad2d4f270fed1585487d5ec84e';

	constructor() {}

	async encrypt(text: string): Promise<string> {
		const cipher = crypto.createCipheriv('aes-256-cbc', this.cipher_password_hash, this.cipher_iv);
		try {
			const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
			return encrypted;
		} catch (error) {
			return '';
		}
	}

	async decrypt(text: string): Promise<string> {
		const decipher = crypto.createDecipheriv('aes-256-cbc', this.cipher_password_hash, this.cipher_iv);
		try {
			const decryptedData = decipher.update(text, 'base64', 'utf8') + decipher.final('utf8');
			return decryptedData;
		} catch (error) {
			return '';
		}
	}
}
