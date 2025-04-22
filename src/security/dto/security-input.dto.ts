import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSecurityPolicyDto {
	@IsBoolean()
	@IsOptional()
	enabled?: boolean;

	@IsNumber()
	@IsOptional()
	maxPoints?: number;

	@IsNumber()
	@IsOptional()
	blockDuration?: number;

	@IsNumber()
	@IsOptional()
	pointsDecayRate?: number;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	whitelistedIps?: string[];

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	blacklistedIps?: string[];
}
