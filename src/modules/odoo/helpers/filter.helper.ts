export class FilterHelper {
	static filterUnnecessaryFields(data: any): any {
		if (!data || typeof data !== 'object') return data;

		const fieldsToExclude = [
			// Campos de mensajería y actividades
			'message_',
			'activity_',
			'rating_',
			'website_message_',
			// Campos de localización específicos
			'extract_',
			'edi_',
			// Campos de autorización y transacciones
			'authorized_transaction_',
			'transaction_',
			// Campos de activos y depreciación (muy específicos)
			'asset_',
			'depreciation_',
			'deferred_',
			// Campos de comercio exterior y otros específicos
			'external_trade',
			'ubl_cii_',
			'string_to_hash',
			// Campos de cesión y declaraciones
			'cession_',
			'sworn_declaration',
			'sii_',
			// Campos personalizados (x_studio)
			'x_studio_',
		];

		if (Array.isArray(data)) {
			return data.map((item) => FilterHelper.filterUnnecessaryFields(item));
		}

		const filtered: any = {};
		for (const [key, value] of Object.entries(data)) {
			// Excluir campos que empiecen con los prefijos definidos
			const shouldExclude = fieldsToExclude.some((prefix) => key.startsWith(prefix));
			if (!shouldExclude) {
				filtered[key] = FilterHelper.filterUnnecessaryFields(value);
			}
		}

		return filtered;
	}
}
