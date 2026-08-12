import { IsOptional, IsString, IsNumber, IsEnum, IsObject } from 'class-validator';
import { ListingType, ListingCategory } from '../enums/listing.enums';

export class UpdateListingDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(ListingType) type?: ListingType;
  @IsOptional() @IsEnum(ListingCategory) category?: ListingCategory;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsNumber() areaSqm?: number;
  @IsOptional() @IsObject() attributes?: Record<string, any>;
}
