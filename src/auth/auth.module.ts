import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuditModule } from '../audit/audit.module';

import { AuthService } from './auth.service';
import { AzureADAuthGuard } from './strategies/azuread-auth.guard';
import { AzureADStrategy } from './strategies/azuread.strategy';

@Module({
	imports: [PassportModule.register({ defaultStrategy: 'azure-ad' }), AuditModule],
	controllers: [],
	providers: [AzureADStrategy, AuthService, AzureADAuthGuard],
	exports: [AzureADAuthGuard],
})
export class AuthModule {}
