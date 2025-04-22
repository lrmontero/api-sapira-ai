// Extender el tipo User de Express para incluir las propiedades personalizadas
declare global {
	namespace Express {
		// Extender la interfaz User existente
		interface User {
			id?: string;
			extension_oid?: string;
			emails?: string[];
			email?: string;
			given_name?: string;
			roles?: string[];
			family_name?: string;
			extension_SegundoApellido?: string;
			oid?: string;
		}
	}
}

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export {};
