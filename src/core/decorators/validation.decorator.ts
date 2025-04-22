import { applyDecorators, SetMetadata } from '@nestjs/common';
import { IsBoolean, IsNumber, IsString, ValidationOptions } from 'class-validator';

export function Validate(validationOptions?: ValidationOptions) {
	return applyDecorators(SetMetadata('validation', true), SetMetadata('validationOptions', validationOptions));
}

export function ValidateString(validationOptions?: ValidationOptions) {
	return applyDecorators(IsString(validationOptions), Validate(validationOptions));
}

export function ValidateNumber(validationOptions?: ValidationOptions) {
	return applyDecorators(IsNumber({}, validationOptions), Validate(validationOptions));
}

export function ValidateBoolean(validationOptions?: ValidationOptions) {
	return applyDecorators(IsBoolean(validationOptions), Validate(validationOptions));
}
