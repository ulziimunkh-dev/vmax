import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class CreatePortfolioItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  materials?: string;

  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  year?: string;
}

export class CreateArticleItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  readMinutes?: number;
}

export class CreateFurnitureMakerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @IsNumber()
  @IsOptional()
  warrantyMonths?: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsOptional()
  addressDetail?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsArray()
  @IsOptional()
  materialsUsed?: string[];

  @IsArray()
  @IsOptional()
  portfolio?: any[];

  @IsArray()
  @IsOptional()
  articles?: any[];
}

export class UpdateFurnitureMakerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @IsNumber()
  @IsOptional()
  warrantyMonths?: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  addressDetail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsArray()
  @IsOptional()
  materialsUsed?: string[];

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class QueryFurnitureDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  hasVideo?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
