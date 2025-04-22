declare module 'sharp' {
	interface Metadata {
		width?: number;
		height?: number;
		format?: string;
		size?: number;
	}

	interface ResizeOptions {
		width?: number;
		height?: number;
		fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
		position?: string;
		background?: string;
		kernel?: string;
		withoutEnlargement?: boolean;
		fastShrinkOnLoad?: boolean;
	}

	interface WebpOptions {
		quality?: number;
		lossless?: boolean;
		nearLossless?: boolean;
		alphaQuality?: number;
		force?: boolean;
	}

	interface Sharp {
		metadata(): Promise<Metadata>;
		resize(width: number | null, height: number | null, options?: ResizeOptions): Sharp;
		webp(options?: WebpOptions): Sharp;
		toBuffer(): Promise<Buffer>;
	}

	function sharp(input?: Buffer | string): Sharp;

	export { Metadata, ResizeOptions, Sharp, WebpOptions };
	export default sharp;
}
