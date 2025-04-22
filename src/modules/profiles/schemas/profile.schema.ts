import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document, Types } from 'mongoose';

import { Contact } from './contact.schema';
import { MeliToken } from './meli-token.schema';

@Schema({ collection: 'users', read: 'nearest', timestamps: true })
export class User extends Document {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, required: false })
	code: string;

	@Prop({ type: String, required: true })
	email: string;

	@Prop({ type: String, required: true })
	fatherName: string;

	@Prop({ type: String, required: false })
	motherName?: string;

	@Prop({ type: String, required: false })
	oid?: string;

	@Prop({ type: Types.ObjectId })
	mainWorkspace: Types.ObjectId;

	@Prop({ type: String, required: false })
	profileImage?: string;

	@Prop({ type: String, required: false })
	cin?: string;

	@Prop({ type: String, required: false })
	birthday?: string;

	@Prop({ type: Boolean, required: false, default: true })
	isActive: boolean;

	@Prop({ type: String, required: false })
	phoneNumber?: string;

	@Prop({ type: String, required: false })
	phoneNumber2?: string;

	@Prop({ type: String, required: false })
	whatsAppNumber?: string;

	@Prop({ type: String, required: false })
	image?: string;

	@Prop({ type: [Contact], required: false })
	contacts?: Contact[];

	@Prop({ type: String, required: false })
	settings?: string;

	@Prop({ type: String, required: false })
	firebaseToken?: string;

	@Prop({ type: String, required: false })
	imageSignature?: string;

	@Prop({ type: String, required: true, default: 'es' })
	locale: string;

	@Prop({ type: String, required: true, default: 'America/Santiago' })
	timezone: string;

	@Prop({ type: Boolean, required: true, default: true })
	validateEmail: boolean;

	@Prop({ type: Number, required: false })
	validationCode?: number;

	@Prop({ type: MeliToken, required: false })
	@IsOptional()
	meliToken?: MeliToken;
}

export const UserSchema = SchemaFactory.createForClass(User);
