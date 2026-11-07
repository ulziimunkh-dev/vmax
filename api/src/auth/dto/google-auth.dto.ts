import { IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  credential?: string;

  @IsOptional()
  @IsString()
  access_token?: string;
}
