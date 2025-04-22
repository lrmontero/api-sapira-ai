import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from '@/modules/profiles/schemas/profile.schema';

import { Role } from '../../roles/schemas/role.schema';

@Schema({ collection: 'teams', read: 'nearest', timestamps: true })
export class Team extends Document {
	@Prop({ type: Types.ObjectId, ref: User.name })
	user: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: Role.name })
	role: Types.ObjectId;

	@Prop({ type: String, default: 'estandar' })
	license: string;

	@Prop({ type: String })
	suscriptionDate: string;

	@Prop({ type: Boolean, default: false })
	ownerStatus: boolean;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: Types.ObjectId })
	createdBy: object;

	@Prop({ type: Types.ObjectId })
	updatedBy: object;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
