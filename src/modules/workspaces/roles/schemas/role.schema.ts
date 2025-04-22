import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Permission } from '../../permissions/schemas/permission.schema';

@Schema({ collection: 'roles', read: 'nearest', timestamps: true })
export class Role extends Document {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, required: true })
	code: string;

	@Prop({ type: String, required: false })
	description?: string;

	@Prop({ type: [{ type: Types.ObjectId, ref: Permission.name }], required: false })
	permissions?: Types.Array<Types.ObjectId>;

	@Prop({ type: Boolean, default: false })
	isDefault: boolean;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: Types.ObjectId })
	createdBy: object;

	@Prop({ type: Types.ObjectId })
	updatedBy: object;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
