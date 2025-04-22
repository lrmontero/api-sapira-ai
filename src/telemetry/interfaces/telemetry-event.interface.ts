export interface BaseTelemetryProperties {
	userId: string;
	timestamp: string;
	correlationId?: string;
	environment?: string;
	version?: string;
}

export interface ApiCallProperties extends BaseTelemetryProperties {
	endpoint: string;
	method: string;
	duration: number;
	statusCode: number;
	errorMessage?: string;
}

export interface DocumentEventProperties extends BaseTelemetryProperties {
	documentId: string;
	documentType: string;
	operation: string;
	duration?: number;
	size?: number;
	result?: 'success' | 'failure';
	errorDetails?: any;
}

export interface AuthEventProperties extends BaseTelemetryProperties {
	provider: 'msal';
	tenantId: string;
	deviceInfo?: {
		browser: string;
		os: string;
		deviceId?: string;
	};
	result?: 'success' | 'failure';
	errorCode?: string;
	errorMessage?: string;
}
