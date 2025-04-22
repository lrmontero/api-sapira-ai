import { ApiProperty } from '@nestjs/swagger';

export class AuditResponseDTO {
	@ApiProperty()
	userId: string;

	@ApiProperty()
	eventType: string;

	@ApiProperty({ type: String })
	details: string;

	@ApiProperty()
	timestamp: Date;

	@ApiProperty()
	userAgent: string;

	@ApiProperty()
	ipAddress: string;
}

export class PaginatedAuditResponseDTO {
	@ApiProperty({ type: [AuditResponseDTO] })
	data: AuditResponseDTO[];

	@ApiProperty()
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export class DocumentStatsDTO {
	@ApiProperty()
	eventType: string;

	@ApiProperty()
	count: number;

	@ApiProperty()
	uniqueUsers: number;

	@ApiProperty()
	avgViewDuration?: number;
}
