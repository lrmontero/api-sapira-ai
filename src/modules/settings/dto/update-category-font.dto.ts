import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

class FontSizesDto {
	@ApiProperty({
		description: 'Tamaño de fuente pequeño para las categorías',
		example: 14,
		type: Number,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	small?: number;

	@ApiProperty({
		description: 'Tamaño de fuente grande para las categorías',
		example: 18,
		type: Number,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	large?: number;
}

export class UpdateCategoryFontDto {
	@ApiProperty({
		description: 'Familia de fuente para las categorías',
		example: 'var(--font-montserrat)',
		type: String,
		required: false,
	})
	@IsOptional()
	@IsString()
	fontFamily?: string;

	@ApiProperty({
		description: 'Configuración de tamaños de fuente',
		type: FontSizesDto,
		required: false,
	})
	@IsOptional()
	fontSizes?: FontSizesDto;
}
