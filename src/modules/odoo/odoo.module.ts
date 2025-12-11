import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MongooseModules } from '@/databases/mongoose/database.module';
import { PostgreSQLDatabaseModule } from '@/databases/postgresql/database.module';
import { EventsModule } from '@/events/events.module';
import { ProfileModule } from '@/modules/profiles/profile.module';
import { WorkspaceModule } from '@/modules/workspaces/workspace.module';

import { OdooController } from './odoo.controller';
import { OdooProvider } from './odoo.provider';
import { OdooService } from './odoo.service';

@Module({
	imports: [MongooseModules, PostgreSQLDatabaseModule, HttpModule, EventsModule, ProfileModule, WorkspaceModule],
	controllers: [OdooController],
	providers: [OdooService, OdooProvider],
	exports: [OdooService],
})
export class OdooModule {}
