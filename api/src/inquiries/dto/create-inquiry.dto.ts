import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
