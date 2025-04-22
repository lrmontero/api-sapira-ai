import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { IRateLimiterOptions, RateLimiterMemory } from 'rate-limiter-flexible';

import { EventSeverity, EventType, SecurityEvent } from '@/core/interfaces/events/event.interface';
import { SecurityViolationType } from '@/core/interfaces/security/security.types';
import { EventEnricherService } from '@/core/services/event-enricher.service';
import { AppLoggerService } from '@/logger/app-logger.service';
import { SecurityService } from '@/security/services/security.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
	private rateLimiter: RateLimiterMemory;

	constructor(
		private readonly securityService: SecurityService,
		private readonly eventEnricher: EventEnricherService,
		private readonly logger: AppLoggerService,
		private readonly configService: ConfigService
	) {
		const rateLimitConfig = this.configService.get('events.security.rateLimit') || {
			points: 500,
			duration: 60,
		};

		const options: IRateLimiterOptions = {
			points: rateLimitConfig.points,
			duration: rateLimitConfig.duration,
			blockDuration: 0, // rateLimitConfig.duration * 2, // Bloquear por el doble de tiempo si se excede
		};

		this.rateLimiter = new RateLimiterMemory(options);
	}

	async use(req: Request, res: Response, next: NextFunction) {
		const ip = req.ip;
		const userId = (req as any).user?.id;

		try {
			// Verificar si la IP está bloqueada
			const { isBlocked, points } = await this.securityService.checkIpStatus(ip);
			if (isBlocked) {
				const securityEvent: Partial<SecurityEvent> = {
					type: EventType.SECURITY,
					violationType: SecurityViolationType.IP_BLACKLISTED,
					severity: EventSeverity.ERROR,
					points,
					ipAddress: ip,
					userId,
					metadata: {
						path: req.path,
						method: req.method,
						action: 'Request Blocked',
					},
				};

				const enrichedEvent = this.eventEnricher.enrichEvent(securityEvent);
				await this.logger.logSecurityViolation(ip, {
					type: enrichedEvent.violationType,
					points: enrichedEvent.points,
					details: enrichedEvent.metadata,
				});

				return res.status(403).json({
					message: 'Access denied. IP is blocked.',
					error: 'BLOCKED_IP',
				});
			}

			// Rate Limiting
			try {
				await this.rateLimiter.consume(ip);
			} catch (rateLimitError) {
				const securityEvent: Partial<SecurityEvent> = {
					type: EventType.SECURITY,
					violationType: SecurityViolationType.RATE_LIMIT_EXCEEDED,
					severity: EventSeverity.WARNING,
					points: 0,
					ipAddress: ip,
					userId,
					metadata: {
						path: req.path,
						method: req.method,
						action: 'Rate Limit Exceeded',
						remainingTime: rateLimitError.msBeforeNext / 1000,
					},
				};

				const enrichedEvent = this.eventEnricher.enrichEvent(securityEvent);
				await this.logger.logSecurityViolation(ip, {
					type: enrichedEvent.violationType,
					points: enrichedEvent.points,
					details: enrichedEvent.metadata,
				});

				return res.status(429).json({
					message: 'Too many requests',
					error: 'RATE_LIMIT_EXCEEDED',
					retryAfter: Math.ceil(rateLimitError.msBeforeNext / 1000),
				});
			}

			// Suspicious Behavior Check
			if (this.isSuspiciousBehavior(req)) {
				const securityEvent: Partial<SecurityEvent> = {
					type: EventType.SECURITY,
					violationType: SecurityViolationType.SUSPICIOUS_ACTIVITY,
					severity: EventSeverity.WARNING,
					points: 3,
					ipAddress: ip,
					userId,
					metadata: {
						path: req.path,
						method: req.method,
						action: 'Suspicious Behavior Detected',
						headers: this.getSanitizedHeaders(req),
					},
				};

				const enrichedEvent = this.eventEnricher.enrichEvent(securityEvent);
				await this.logger.logSecurityViolation(ip, {
					type: enrichedEvent.violationType,
					points: enrichedEvent.points,
					details: enrichedEvent.metadata,
				});
			}

			next();
		} catch (error) {
			this.logger.error('Error in security middleware', error);
			next(error);
		}
	}

	private isSuspiciousBehavior(req: Request): boolean {
		const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
		const hasMultipleProxies = suspiciousHeaders.some((header) => req.headers[header] && String(req.headers[header]).includes(','));
		const suspiciousUserAgent = !req.headers['user-agent'] || req.headers['user-agent'].toString().length < 10;
		const suspiciousReferer = req.headers.referer && !req.headers.referer.toString().startsWith('https');

		return hasMultipleProxies || suspiciousUserAgent || suspiciousReferer;
	}

	private getSanitizedHeaders(req: Request): Record<string, string> {
		const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
		return Object.entries(req.headers).reduce(
			(acc, [key, value]) => {
				if (sensitiveHeaders.includes(key.toLowerCase())) {
					acc[key] = '[REDACTED]';
				} else {
					acc[key] = String(value);
				}
				return acc;
			},
			{} as Record<string, string>
		);
	}
}
