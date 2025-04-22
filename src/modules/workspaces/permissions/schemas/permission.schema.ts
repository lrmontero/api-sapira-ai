import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'permissions', read: 'nearest', timestamps: true })
export class Permission extends Document {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, required: true })
	code: string;

	@Prop({ type: String, required: true })
	category: string;

	@Prop({ type: String, required: true })
	project: string;

	@Prop({ type: Number, required: true })
	sequence: number;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: Types.ObjectId })
	createdBy: object;

	@Prop({ type: Types.ObjectId })
	updatedBy: object;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
