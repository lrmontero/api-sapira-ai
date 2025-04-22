/**
 * Extrae el nombre del archivo de una URL
 * @param url URL de la imagen
 * @returns Nombre del archivo o null si no se puede extraer
 */
export function getFilenameFromUrl(url: string): string | null {
	try {
		// Extraer el nombre del archivo de la URL
		const urlParts = url.split('/');
		return urlParts[urlParts.length - 1];
	} catch (error) {
		console.error('Error al extraer el nombre del archivo de la URL:', error);
		return null;
	}
}
