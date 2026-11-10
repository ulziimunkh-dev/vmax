import { IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
