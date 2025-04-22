import { Connection } from 'mongoose';

import { InvitationSchema } from './invitations/schemas/invitation.schema';
import { LicenseSchema } from './licenses/schemas/license.schema';
import { PermissionSchema } from './permissions/schemas/permission.schema';
import { RoleSchema } from './roles/schemas/role.schema';
import { WorkspaceSchema } from './schemas/workspace.schema';
import { TeamSchema } from './teams/schemas/team.schema';

export const WorkspaceProviders = [
	{
		provide: 'WorkspaceModelToken',
		useFactory: (connection: Connection) => connection.model('Workspace', WorkspaceSchema),
		inject: ['DbConnectionToken'],
	},
	{
		provide: 'TeamModelToken',
		useFactory: (connection: Connection) => connection.model('Team', TeamSchema),
		inject: ['DbConnectionToken'],
	},
	{
		provide: 'RoleModelToken',
		useFactory: (connection: Connection) => connection.model('Role', RoleSchema),
		inject: ['DbConnectionToken'],
	},
	{
		provide: 'PermissionModelToken',
		useFactory: (connection: Connection) => connection.model('Permission', PermissionSchema),
		inject: ['DbConnectionToken'],
	},
	{
		provide: 'LicenseModelToken',
		useFactory: (connection: Connection) => connection.model('License', LicenseSchema),
		inject: ['DbConnectionToken'],
	},
	{
		provide: 'InvitationModelToken',
		useFactory: (connection: Connection) => connection.model('Invitation', InvitationSchema),
		inject: ['DbConnectionToken'],
	},
];
