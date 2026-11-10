import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  startOrGetConversation(
    @CurrentUser() user: any,
    @Body() dto: StartConversationDto,
  ) {
    return this.chatService.startOrGetConversation(user, dto);
  }

  @Get('conversations')
  getUserConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.chatService.getUnreadCount(user.id);
  }

  @Get('conversations/:id/messages')
  getConversationMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getConversationMessages(conversationId, user.id);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(conversationId, user, dto.content, dto.imageUrl);
  }

  @Delete('conversations/:id')
  deleteConversation(
    @Param('id') conversationId: string,
    @CurrentUser() user: any,
  ) {
    return this.chatService.deleteConversation(conversationId, user.id);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.chatService.deleteMessage(conversationId, messageId, user.id);
  }
}
