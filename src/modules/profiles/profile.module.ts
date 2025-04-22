import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { MongooseModules } from '@/databases/mongoose/database.module';
import { EventsModule } from '@/events/events.module';

import { MSGraphService } from '../utils/msgraph/msgraph.service';
import { WorkspaceModule } from '../workspaces/workspace.module';
import { WorkspaceService } from '../workspaces/workspace.service';

import { ProfileController } from './profile.controller';
import { ProfileProviders } from './profile.provider';
import { ProfileService } from './profile.service';

@Module({
	imports: [MongooseModules, HttpModule, forwardRef(() => WorkspaceModule), forwardRef(() => EventsModule)],
	controllers: [ProfileController],
	providers: [ProfileService, ...ProfileProviders, WorkspaceService, MSGraphService],
	exports: [ProfileService],
})
export class ProfileModule {}
