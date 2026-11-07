import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiChatDto, GenerateDescriptionDto, EstimatePriceDto } from './dto/ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: AiChatDto) {
    return this.aiService.chat(dto);
  }

  @Post('generate-description')
  @HttpCode(HttpStatus.OK)
  async generateDescription(@Body() dto: GenerateDescriptionDto) {
    return this.aiService.generateDescription(dto);
  }

  @Post('estimate-price')
  @HttpCode(HttpStatus.OK)
  async estimatePrice(@Body() dto: EstimatePriceDto) {
    return this.aiService.estimatePrice(dto);
  }
}
