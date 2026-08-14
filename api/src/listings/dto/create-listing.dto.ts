import { IsString, IsEnum, IsNumber, IsOptional, IsObject, IsArray } from 'class-validator';
import { ListingType, ListingCategory } from '../enums/listing.enums';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ListingType)
  type: ListingType;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  khoroo?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNumber()
  areaSqm: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
