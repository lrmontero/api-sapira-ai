import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// TODO. cambiar nombre de variables corregir citie por city y agregar district
@Schema({ collection: 'cities', read: 'nearest' })
export class Cities extends Document {
	@Prop({ type: String, required: true })
	code_citie: string;

	@Prop({ type: String, required: true })
	name_citie: string;

	@Prop({ type: String, required: true })
	code_region: string;

	@Prop({ type: String, required: true })
	name_region: string;
}

export const CitiesSchema = SchemaFactory.createForClass(Cities);
