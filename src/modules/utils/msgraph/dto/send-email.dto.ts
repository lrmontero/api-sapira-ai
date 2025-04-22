import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
	@IsArray()
	@IsEmail({}, { each: true })
	@ApiProperty({ example: ['ejemplo@dominio.com'] })
	to: string[];

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Asunto del correo' })
	subject: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: '<h1>Contenido HTML</h1>' })
	body: string;

	@IsOptional()
	@ApiProperty({ required: false })
	attachments?: any[];
}
