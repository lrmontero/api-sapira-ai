import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'licenses', read: 'nearest', timestamps: true })
export class License extends Document {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: Number, default: 1, required: false })
	quantity: number;

	@Prop({ type: Number, required: false })
	orderNumber: number;

	@Prop({ type: Number, default: 0, required: false })
	available: number;

	@Prop({ type: Number, required: false })
	frequency: number;

	@Prop({ type: Date, default: Date.now })
	expiryDate: string;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: Types.ObjectId })
	createdBy: object;

	@Prop({ type: Types.ObjectId })
	updatedBy: object;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
