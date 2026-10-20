import { IsOptional, IsString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, FloorPlanItem, ProjectReelItem } from '../project.entity';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  developerName: string;

  @IsOptional()
  @IsString()
  developerLogo?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  completionYearQuarter?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  khoroo?: string;

  @IsOptional()
  @IsString()
  addressDetail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsString()
  salesPhone: string;

  @IsOptional()
  @IsString()
  salesEmail?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  facebookPageUrl?: string;

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsString()
  viberOrTelegramUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPricePerSqm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPricePerSqm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startingPrice?: number;

  @IsOptional()
  @IsArray()
  paymentTerms?: string[];

  @IsOptional()
  @IsArray()
  specialOffers?: string[];

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  @IsString()
  tour3dUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoThumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  reels?: ProjectReelItem[];

  @IsString()
  coverImage: string;

  @IsOptional()
  @IsArray()
  galleryImages?: string[];

  @IsOptional()
  @IsString()
  brochurePdfUrl?: string;

  @IsOptional()
  @IsArray()
  floorPlans?: FloorPlanItem[];
}

export class QueryProjectDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPricePerSqm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPricePerSqm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rooms?: number;

  @IsOptional()
  has3dTour?: any;

  @IsOptional()
  has6PercentLoan?: any;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
