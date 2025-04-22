export enum EventType {
	// Eventos de autenticación
	LOGIN = 'login',
	LOGOUT = 'logout',
	LOGIN_FAILED = 'login_failed',

	// Eventos de seguridad
	SECURITY_VIOLATION = 'security_violation',
	ACCESS_DENIED = 'access_denied',

	// Eventos de documentos
	DOCUMENT_CREATE = 'document_create',
	DOCUMENT_UPDATE = 'document_update',
	DOCUMENT_DELETE = 'document_delete',
	DOCUMENT_VIEW = 'document_view',

	// Eventos de negocio
	BUSINESS_TRANSACTION = 'business_transaction',
	BUSINESS_PROCESS = 'business_process',

	// Eventos del cliente
	CLIENT_ERROR = 'client_error',
	CLIENT_ACTION = 'client_action',

	// Eventos del sistema
	SYSTEM_ERROR = 'system_error',
	SYSTEM_WARNING = 'system_warning',
	SYSTEM_INFO = 'system_info',
}
