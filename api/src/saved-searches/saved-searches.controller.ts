import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  async create(
    @Body() body: {
      userId?: string;
      email?: string;
      title?: string;
      filters: {
        query?: string;
        type?: string;
        category?: string;
        district?: string;
        priceMin?: number;
        priceMax?: number;
      };
      isEmailAlert?: boolean;
    },
  ) {
    return this.savedSearchesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMySavedSearches(@CurrentUser() user: any) {
    return this.savedSearchesService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.savedSearchesService.delete(id, user.id);
  }
}
