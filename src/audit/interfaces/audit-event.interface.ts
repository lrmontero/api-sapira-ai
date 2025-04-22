export interface BaseAuditEvent {
	userId: string;
	eventType: string;
	action: string;
	resourceType: string;
	resourceId: string;
	timestamp: Date;
	correlationId: string;
	deviceInfo: any;
}
