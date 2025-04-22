import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { AuditModule } from '@/audit/audit.module';
import { MongooseModules } from '@/databases/mongoose/database.module';
import { EventsModule } from '@/events/events.module';

import { ProfileModule } from '../profiles/profile.module';
import { ProfileProviders } from '../profiles/profile.provider';
import { ProfileService } from '../profiles/profile.service';
import { CryptoService } from '../utils/crypto/crypto.service';
import { MSGraphService } from '../utils/msgraph/msgraph.service';

import { PermissionController } from './permissions/permission.controller';
import { PermissionService } from './permissions/permission.service';
import { RoleService } from './roles/role.service';
import { TeamService } from './teams/team.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceProviders } from './workspace.provider';
import { WorkspaceService } from './workspace.service';

@Module({
	imports: [MongooseModules, HttpModule, forwardRef(() => ProfileModule), forwardRef(() => EventsModule), forwardRef(() => AuditModule)],
	controllers: [WorkspaceController, PermissionController],
	providers: [
		WorkspaceService,
		...WorkspaceProviders,
		...ProfileProviders,
		ProfileService,
		TeamService,
		RoleService,
		PermissionService,
		MSGraphService,
		CryptoService,
	],
	exports: [WorkspaceService, ...WorkspaceProviders, TeamService, CryptoService, RoleService, PermissionService],
})
export class WorkspaceModule {}
