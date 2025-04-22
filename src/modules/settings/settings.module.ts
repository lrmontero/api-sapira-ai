import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { MongooseModules } from '@/databases/mongoose/database.module';
import { EventsModule } from '@/events/events.module';
import { ProfileModule } from '@/modules/profiles/profile.module';
import { WorkspaceModule } from '@/modules/workspaces/workspace.module';

import { SettingsController } from './settings.controller';
import { SettingsProviders } from './settings.provider';
import { SettingsService } from './settings.service';

@Module({
	imports: [MongooseModules, EventsModule, ProfileModule, AuthModule, WorkspaceModule],
	controllers: [SettingsController],
	providers: [SettingsService, ...SettingsProviders],
	exports: [SettingsService],
})
export class SettingsModule {}
