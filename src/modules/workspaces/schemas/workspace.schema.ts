import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { License } from '../licenses/schemas/license.schema';
import { Role } from '../roles/schemas/role.schema';
import { Team } from '../teams/schemas/team.schema';

@Schema({ collection: 'workspaces', read: 'nearest', timestamps: true })
export class Workspace extends Document {
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: String, default: '', required: false })
	logo: string;

	@Prop({ type: String, required: false })
	contactEmail: string;

	@Prop({ type: Boolean, default: true })
	isDefault: boolean;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: [{ type: Types.ObjectId, ref: License.name }] })
	licenses: Types.Array<Types.ObjectId>;

	@Prop({ type: [{ type: Types.ObjectId, ref: Team.name }] })
	team: Types.Array<Types.ObjectId>;

	@Prop({ type: [Team] })
	teamMembers: Types.Array<Team>;

	@Prop({ type: [{ type: Types.ObjectId, ref: Role.name }] })
	roles: Types.Array<Types.ObjectId>;

	@Prop({ type: String, required: false })
	buttonColor: string;

	@Prop({ type: String, required: false })
	buttonTextColor: string;

	@Prop({ type: String })
	accountCin: string;

	@Prop({ type: String })
	accountEmail: string;

	@Prop({ type: String })
	accountFullName: string;

	@Prop({ type: String })
	accountName: string;

	@Prop({ type: String })
	accountNumber: string;

	@Prop({ type: String })
	accountType: string;

	@Prop({ type: String })
	bankName: string;

	@Prop({ type: String })
	billingEmail: string;

	@Prop({ type: String })
	businessActivity: string;

	@Prop({ type: String })
	companyAddress: string;

	@Prop({ type: String })
	companyNumberAddress: string;

	@Prop({ type: String })
	companyOfficeAddress: string;

	@Prop({ type: String })
	companyCin: string;

	@Prop({ type: String })
	companyDistrict: string;

	@Prop({ type: String })
	companyName: string;

	@Prop({ type: String })
	companyRegion: string;

	@Prop({ type: String })
	phoneNumber: string;

	@Prop({ type: String })
	mobileNumber: string;

	@Prop({ type: String })
	website: string;

	@Prop({ type: String, required: false })
	vat: string;

	@Prop({ type: String, required: false })
	regionalOfficeSii: string;

	@Prop({ type: Number })
	resolutionNumber: number;

	@Prop({ type: Date })
	resolutionDate: string;

	@Prop({ type: String, required: false })
	nameServer: string;

	@Prop({ type: String, required: false })
	port: string;

	@Prop({ type: Boolean, required: false })
	sslTls: boolean;

	@Prop({ type: String, required: false })
	userNameEmail: string;

	@Prop({ type: String, required: false })
	userPasswordEmail: string;

	@Prop({ type: String, required: false })
	siiEnvironment: string;

	@Prop({ type: String, required: false })
	typeTaxpayer: string;

	@Prop({ type: Array })
	economicActivities: Types.Array<any>;

	@Prop({ type: Date })
	startActivities: string;

	@Prop({ type: Types.ObjectId })
	createdBy: object;

	@Prop({ type: Types.ObjectId })
	updatedBy: object;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
