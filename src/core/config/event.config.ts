import { registerAs } from '@nestjs/config';

export const eventConfig = registerAs('events', () => ({
	security: {
		pointThresholds: {
			low: parseInt(process.env.SECURITY_POINTS_LOW || '10'),
			medium: parseInt(process.env.SECURITY_POINTS_MEDIUM || '50'),
			high: parseInt(process.env.SECURITY_POINTS_HIGH || '100'),
		},
		retryPolicy: {
			attempts: parseInt(process.env.SECURITY_RETRY_ATTEMPTS || '3'),
			delay: parseInt(process.env.SECURITY_RETRY_DELAY || '1000'),
		},
	},
	telemetry: {
		sampling: {
			percentage: parseInt(process.env.TELEMETRY_SAMPLING_PERCENTAGE || '100'),
		},
		correlation: {
			enabled: process.env.ENABLE_CORRELATION === 'true',
		},
	},
	audit: {
		retention: {
			days: parseInt(process.env.AUDIT_RETENTION_DAYS || '90'),
		},
	},
}));

export default eventConfig;
