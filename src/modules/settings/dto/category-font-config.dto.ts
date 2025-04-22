import { ApiProperty } from '@nestjs/swagger';

class FontSizes {
	@ApiProperty({
		description: 'Tamaño de fuente pequeño para las categorías',
		example: 14,
		type: Number,
	})
	small: number;

	@ApiProperty({
		description: 'Tamaño de fuente grande para las categorías',
		example: 18,
		type: Number,
	})
	large: number;
}

export class CategoryFontConfigDto {
	@ApiProperty({
		description: 'Familia de fuente para las categorías',
		example: 'var(--font-montserrat)',
		type: String,
	})
	fontFamily: string;

	@ApiProperty({
		description: 'Configuración de tamaños de fuente',
		type: FontSizes,
	})
	fontSizes: FontSizes;
}
