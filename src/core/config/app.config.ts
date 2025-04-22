import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
	port: parseInt(process.env.PORT || '3000', 10),
	environment: process.env.NODE_ENV || 'development',
	apiPrefix: process.env.API_PREFIX || 'api',
	version: process.env.APP_VERSION || '1.0.0',
	cors: {
		enabled: process.env.CORS_ENABLED === 'true',
		origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
	},
	logging: {
		level: process.env.LOG_LEVEL || 'info',
		pretty: process.env.LOG_PRETTY === 'true',
	},
}));
