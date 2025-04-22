/**
 * Umbral de puntos para bloqueo de IP
 * Si una IP alcanza o supera este valor, será bloqueada
 */
export const POINTS_THRESHOLD = 100;

/**
 * Umbrales de riesgo basados en puntos
 */
export const RISK_THRESHOLDS = {
	HIGH: POINTS_THRESHOLD,
	MEDIUM: POINTS_THRESHOLD * 0.7,
	LOW: POINTS_THRESHOLD * 0.3,
} as const;

/**
 * Duración del bloqueo de IP en milisegundos (24 horas)
 */
export const IP_BLOCK_DURATION = 24 * 60 * 60 * 1000;

/**
 * Número máximo de intentos fallidos antes de bloquear
 */
export const MAX_FAILED_ATTEMPTS = 5;
