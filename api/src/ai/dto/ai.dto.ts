import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class AiChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class GenerateDescriptionDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'SALE' | 'RENT'

  @IsOptional()
  @IsString()
  category?: string; // 'APARTMENT', 'HOUSE', etc.

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  khoroo?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  areaSqm: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  highlights?: string[]; // e.g. ['Урагшаа харсан цонхтой', 'Бүрэн засвартай', 'Сургуульдаа ойр']
}

export class EstimatePriceDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'SALE' | 'RENT'

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  khoroo?: string;

  @IsNumber()
  areaSqm: number;

  @IsOptional()
  @IsNumber()
  price?: number;
}
