import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({
	timestamps: true,
	collection: 'settings',
})
export class Settings {
	@Prop({ required: true, unique: true })
	key: string;

	@Prop({ required: true, type: Object })
	value: any;

	@Prop()
	description?: string;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
