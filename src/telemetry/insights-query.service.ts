import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface InsightsQueryOptions {
	timespan?: string; // formato: 'P1D' para 1 día, 'P7D' para 7 días, etc.
	workspace?: string;
	limit?: number;
}

@Injectable()
export class InsightsQueryService {
	private readonly baseUrl: string;
	private readonly appId: string;
	private readonly apiKey: string;

	constructor(private configService: ConfigService) {
		this.appId = this.configService.get<string>('APPLICATIONINSIGHTS_APP_ID');
		this.apiKey = this.configService.get<string>('APPLICATIONINSIGHTS_API_KEY');
		this.baseUrl = `https://api.applicationinsights.io/v1/apps/${this.appId}`;
	}

	private async executeQuery(query: string, options: InsightsQueryOptions = {}) {
		try {
			const { timespan = 'P1D', limit = 100 } = options;

			const response = await axios.post(
				`${this.baseUrl}/query`,
				{ query, timespan },
				{
					headers: {
						'X-Api-Key': this.apiKey,
						'Content-Type': 'application/json',
					},
				}
			);

			return response.data.tables[0].rows.slice(0, limit);
		} catch (error) {
			console.error('Error executing Application Insights query:', error);
			throw new Error('Error querying Application Insights');
		}
	}

	async getBusinessOperations(options: InsightsQueryOptions = {}) {
		const { workspace } = options;
		const query = `
            customEvents
            | where timestamp > ago(${options.timespan || 'P1D'})
            | where name == "BusinessOperation"
            | extend operation = tostring(customDimensions.operation)
            | extend success = toboolean(customDimensions.success)
            ${workspace ? "| where tostring(customDimensions.workspace) == '" + workspace + "'" : ''}
            | summarize 
                total=count(),
                successful=countif(success == true),
                failed=countif(success == false)
            by operation
            | project operation, total, successful, failed, successRate=(todouble(successful)/todouble(total)) * 100
            | order by total desc
        `;

		return this.executeQuery(query, options);
	}

	async getAuditLogs(options: InsightsQueryOptions = {}) {
		const { workspace } = options;
		const query = `
            customEvents
            | where timestamp > ago(${options.timespan || 'P1D'})
            | where name == "AuditLog"
            | extend 
                userId = tostring(customDimensions.userId),
                action = tostring(customDimensions.action),
                resource = tostring(customDimensions.resource),
                result = tostring(customDimensions.result)
            ${workspace ? "| where tostring(customDimensions.workspace) == '" + workspace + "'" : ''}
            | project timestamp, userId, action, resource, result
            | order by timestamp desc
        `;

		return this.executeQuery(query, options);
	}

	async getEndpointPerformance(options: InsightsQueryOptions = {}) {
		const { workspace } = options;
		const query = `
            customMetrics
            | where timestamp > ago(${options.timespan || 'P1D'})
            | where name startswith "Endpoint_"
            ${workspace ? "| where tostring(customDimensions.workspace) == '" + workspace + "'" : ''}
            | summarize
                count=count(),
                avgDuration=avg(value),
                p95Duration=percentile(value, 95)
            by name
            | extend endpoint=replace("Endpoint_", "", name)
            | project endpoint, count, avgDuration, p95Duration
            | order by avgDuration desc
        `;

		return this.executeQuery(query, options);
	}

	async getSystemHealth(options: InsightsQueryOptions = {}) {
		const query = `
            customMetrics
            | where timestamp > ago(${options.timespan || 'P1D'})
            | where name == "SystemHealth"
            | extend 
                freeMemory = todouble(customDimensions.freeMemory),
                uptime = todouble(customDimensions.uptime)
            | summarize
                avgMemoryUsed=avg(value),
                avgFreeMemory=avg(freeMemory),
                maxMemoryUsed=max(value)
            by bin(timestamp, 1h)
            | order by timestamp desc
        `;

		return this.executeQuery(query, options);
	}
}
