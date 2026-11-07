import { IsOptional, IsString } from 'class-validator';

export class PhoneLoginSessionDto {
  @IsString()
  phone: string;
}

export class CreatePhoneSessionDto {
  @IsOptional()
  @IsString()
  phone?: string;
}

export class VerifyPhoneDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
