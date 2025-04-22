import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { EventsModule } from '@/events/events.module';
import { ProfileModule } from '@/modules/profiles/profile.module';
import { WorkspaceModule } from '@/modules/workspaces/workspace.module';

import { MSGraphController } from './msgraph.controller';
import { MSGraphService } from './msgraph.service';

@Module({
	controllers: [MSGraphController],
	providers: [MSGraphService],
	imports: [HttpModule, forwardRef(() => ProfileModule), forwardRef(() => EventsModule), forwardRef(() => WorkspaceModule)],
	exports: [MSGraphService],
})
export class MSGraphModule {}
