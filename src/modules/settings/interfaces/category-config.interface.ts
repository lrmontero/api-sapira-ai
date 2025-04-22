export interface CategoryFontConfig {
	fontFamily?: string; // La familia de fuente, ej: 'var(--font-montserrat)'
	fontSizes?: {
		small?: number; // Tamaño para texto pequeño, ej: 14
		large?: number; // Tamaño para texto grande, ej: 18
	};
}
