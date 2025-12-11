import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OdooConnectionDocument = OdooConnection & Document;

@Schema({ timestamps: true })
export class OdooConnection {
	@Prop({ required: true })
	url: string;

	@Prop({ required: true })
	database_name: string;

	@Prop({ required: true })
	username: string;

	@Prop({ required: true })
	api_key: string;

	@Prop({ required: true })
	holding_id: string;

	@Prop({ default: true })
	active: boolean;

	@Prop()
	description?: string;
}

export const OdooConnectionSchema = SchemaFactory.createForClass(OdooConnection);

export type OdooInvoiceStagingDocument = OdooInvoiceStaging & Document;

@Schema({ timestamps: true })
export class OdooInvoiceStaging {
	@Prop({ required: true })
	odoo_id: number;

	@Prop({ type: Object, required: true })
	raw_data: any;

	@Prop({ required: true })
	sync_batch_id: string;

	@Prop({ required: true })
	holding_id: string;

	@Prop({ default: 'pending' })
	processing_status: string;

	@Prop()
	batch_id?: string;

	@Prop()
	sync_session_id?: string;
}

export const OdooInvoiceStagingSchema = SchemaFactory.createForClass(OdooInvoiceStaging);

export type OdooInvoiceLineStagingDocument = OdooInvoiceLineStaging & Document;

@Schema({ timestamps: true })
export class OdooInvoiceLineStaging {
	@Prop({ required: true })
	invoice_staging_id: string;

	@Prop({ required: true })
	odoo_line_id: number;

	@Prop({ required: true })
	odoo_invoice_id: number;

	@Prop({ type: Object, required: true })
	raw_data: any;

	@Prop({ required: true })
	holding_id: string;

	@Prop({ default: 'pending' })
	processing_status: string;

	@Prop()
	batch_id?: string;

	@Prop()
	sync_session_id?: string;
}

export const OdooInvoiceLineStagingSchema = SchemaFactory.createForClass(OdooInvoiceLineStaging);

export type OdooPartnerStagingDocument = OdooPartnerStaging & Document;

@Schema({ timestamps: true })
export class OdooPartnerStaging {
	@Prop({ required: true })
	odoo_id: number;

	@Prop({ type: Object, required: true })
	raw_data: any;

	@Prop({ required: true })
	sync_batch_id: string;

	@Prop({ required: true })
	holding_id: string;

	@Prop({ default: 'pending' })
	processing_status: string;

	@Prop()
	sync_session_id?: string;
}

export const OdooPartnerStagingSchema = SchemaFactory.createForClass(OdooPartnerStaging);
