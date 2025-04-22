import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditDocument = Audit & Document;

@Schema({
	timestamps: true,
	collection: 'audits',
	// TTL index para expirar documentos antiguos (90 días)
	expires: 7776000,
})
export class Audit {
	@Prop({
		required: true,
		index: true,
		type: MongooseSchema.Types.ObjectId,
		ref: 'User',
	})
	userId: MongooseSchema.Types.ObjectId;

	@Prop({ required: true, index: true })
	eventType: string;

	@Prop()
	action?: string;

	@Prop()
	resourceType?: string;

	@Prop()
	resourceId?: string;

	@Prop({ type: String, required: true })
	details: string;

	@Prop()
	deviceInfo?: string;

	@Prop()
	req?: string;

	@Prop()
	body?: string;

	@Prop()
	params?: string;

	@Prop({ required: true, index: true })
	timestamp: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Índices compuestos para consultas comunes
AuditSchema.index({ userId: 1, timestamp: -1 });
AuditSchema.index({ eventType: 1, timestamp: -1 });
AuditSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
