import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class StartConversationDto {
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @IsString()
  @IsOptional()
  initialMessage?: string;
}
