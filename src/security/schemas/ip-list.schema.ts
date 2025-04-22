import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class IpList extends Document {
	@Prop({ required: true, unique: true })
	ip: string;

	@Prop({ required: true, enum: ['whitelist', 'blacklist'] })
	listType: string;

	@Prop()
	reason: string;

	@Prop()
	addedBy: string;

	@Prop({ type: Date })
	expiresAt?: Date;

	@Prop({ type: Boolean, default: true })
	isActive: boolean;

	@Prop({ type: Number, default: 0 })
	points: number;

	@Prop({ type: Date })
	timestamp: Date;

	@Prop({ type: Object })
	metadata: Record<string, any>;

	@Prop({ type: Date })
	createdAt: Date;

	@Prop({ type: Date })
	updatedAt: Date;
}

export const IpListSchema = SchemaFactory.createForClass(IpList);

// Crear índices
IpListSchema.index({ ip: 1, listType: 1 }, { unique: true });
IpListSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
IpListSchema.index({ timestamp: -1 }); // Índice para ordenar por timestamp
IpListSchema.index({ points: 1 }); // Índice para consultas por puntos
