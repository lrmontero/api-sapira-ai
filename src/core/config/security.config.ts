import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
	rateLimit: {
		ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
		limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
	},
	ipBlocking: {
		maxPoints: parseInt(process.env.IP_BLOCK_MAX_POINTS || '100', 10),
		blockDuration: parseInt(process.env.IP_BLOCK_DURATION || '3600000', 10),
		pointsDecayRate: parseInt(process.env.IP_POINTS_DECAY_RATE || '1', 10),
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'your-secret-key',
		expiresIn: process.env.JWT_EXPIRES_IN || '1h',
	},
}));
