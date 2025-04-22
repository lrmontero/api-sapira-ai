import { registerAs } from '@nestjs/config';
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
	.setTitle('API SAEIA 1.0')
	.setDescription('API Rest para SAEIA')
	.setVersion('1.0.0')
	.setContact('SYSCODE', 'https://github.com/syscode', 'sebastian.gonzalez@syscode.cloud')
	.addBearerAuth()
	.build();

export default registerAs('site', () => ({
	swagger: swaggerConfig,
}));
