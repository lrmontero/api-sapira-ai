import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from '../../../profiles/schemas/profile.schema';
import { Role } from '../../roles/schemas/role.schema';
import { Workspace } from '../../schemas/workspace.schema';

@Schema({ collection: 'invitations', read: 'nearest' })
export class Invitation extends Document {
	@Prop({ type: Types.ObjectId, ref: User.name })
	senderId: User | Types.ObjectId;

	@Prop({ type: String, required: false })
	receiverEmail: string;

	@Prop({ type: Types.ObjectId, ref: Workspace.name })
	workspaceId: Workspace | Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: Role.name })
	roleId: Role | Types.ObjectId;

	@Prop({ type: String, default: 'pending', required: true })
	status: string;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: Date, default: Date.now })
	createdAt: string;

	@Prop({ type: Date })
	updatedAt: string;

	@Prop({ type: Types.ObjectId })
	createdBy: object;

	@Prop({ type: Types.ObjectId })
	updatedBy: object;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
