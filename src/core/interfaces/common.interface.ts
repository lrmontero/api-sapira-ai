export interface Identifiable {
	id: string;
}

export interface Timestampable {
	createdAt: Date;
	updatedAt: Date;
}

export interface Auditable extends Timestampable {
	createdBy?: string;
	updatedBy?: string;
}

export interface Metadata {
	[key: string]: any;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sort?: string;
	order?: 'ASC' | 'DESC';
}

export interface FilterParams {
	[key: string]: string | number | boolean | Date | Array<string | number | boolean | Date>;
}
