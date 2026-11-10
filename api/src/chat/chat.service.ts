import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Listing } from '../listings/listing.entity';
import { User } from '../users/user.entity';
import { StartConversationDto } from './dto/start-conversation.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async startOrGetConversation(user: User, dto: StartConversationDto) {
    const listing = await this.listingRepo.findOne({
      where: { id: dto.listingId },
      relations: { user: true },
    });

    if (!listing) {
      throw new NotFoundException('Зар олдсонгүй.');
    }

    let conversation = await this.conversationRepo.findOne({
      where: {
        listingId: listing.id,
        renterId: user.id,
      },
      relations: {
        listing: true,
        host: true,
        renter: true,
      },
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({
        listingId: listing.id,
        renterId: user.id,
        hostId: listing.userId,
        lastMessage: dto.initialMessage || 'Чат эхлүүлсэн',
        lastMessageSenderId: user.id,
        lastMessageAt: new Date(),
        hostUnreadCount: dto.initialMessage ? 1 : 0,
        renterUnreadCount: 0,
      });

      const saved = await this.conversationRepo.save(conversation);

      const reloaded = await this.conversationRepo.findOne({
        where: { id: saved.id },
        relations: {
          listing: true,
          host: true,
          renter: true,
        },
      });

      if (!reloaded) {
        throw new NotFoundException('Харилцан яриа үүсгэхэд алдаа гарлаа.');
      }
      conversation = reloaded;
    }

    if (!conversation) {
      throw new NotFoundException('Харилцан яриа олдсонгүй.');
    }

    if (dto.initialMessage?.trim()) {
      const msg = this.messageRepo.create({
        conversationId: conversation.id,
        senderId: user.id,
        content: dto.initialMessage.trim(),
      });
      await this.messageRepo.save(msg);

      conversation.lastMessage = dto.initialMessage.trim();
      conversation.lastMessageSenderId = user.id;
      conversation.lastMessageAt = new Date();
      conversation.hostUnreadCount += 1;
      await this.conversationRepo.save(conversation);

      // Email notification to host
      if (listing.user && listing.userId !== user.id) {
        this.mailService.sendNewChatMessageNotification(
          listing.user,
          user,
          listing,
          dto.initialMessage.trim(),
        );
      }
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.listing', 'listing')
      .leftJoinAndSelect('conversation.host', 'host')
      .leftJoinAndSelect('conversation.renter', 'renter')
      .where('conversation.renterId = :userId OR conversation.hostId = :userId', { userId })
      .orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Sanitize user sensitive data
    return conversations.map((conv) => ({
      ...conv,
      host: conv.host
        ? {
            id: conv.host.id,
            name: conv.host.name,
            phone: conv.host.phone,
            avatarUrl: conv.host.avatarUrl,
            isVerifiedAgent: conv.host.isVerifiedAgent,
          }
        : null,
      renter: conv.renter
        ? {
            id: conv.renter.id,
            name: conv.renter.name,
            phone: conv.renter.phone,
            avatarUrl: conv.renter.avatarUrl,
          }
        : null,
    }));
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: {
        listing: true,
        host: true,
        renter: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Харилцан яриа олдсонгүй.');
    }

    if (conversation.renterId !== userId && conversation.hostId !== userId) {
      throw new ForbiddenException('Танд энэ чатыг харах эрх байхгүй байна.');
    }

    // Reset unread count for current user
    let needsUpdate = false;
    if (conversation.renterId === userId && conversation.renterUnreadCount > 0) {
      conversation.renterUnreadCount = 0;
      needsUpdate = true;
    }
    if (conversation.hostId === userId && conversation.hostUnreadCount > 0) {
      conversation.hostUnreadCount = 0;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await this.conversationRepo.save(conversation);
    }

    // Mark messages sent by the other party as read
    await this.messageRepo
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ isRead: true })
      .where('conversationId = :cid AND senderId != :uid AND isRead = false', {
        cid: conversationId,
        uid: userId,
      })
      .execute();

    const messages = await this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      relations: {
        sender: true,
      },
    });

    return {
      conversation: {
        ...conversation,
        host: conversation.host
          ? {
              id: conversation.host.id,
              name: conversation.host.name,
              phone: conversation.host.phone,
              avatarUrl: conversation.host.avatarUrl,
            }
          : null,
        renter: conversation.renter
          ? {
              id: conversation.renter.id,
              name: conversation.renter.name,
              phone: conversation.renter.phone,
              avatarUrl: conversation.renter.avatarUrl,
            }
          : null,
      },
      messages: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.sender?.name || 'Хэрэглэгч',
        senderAvatar: m.sender?.avatarUrl,
        content: m.content,
        imageUrl: m.imageUrl,
        isRead: m.isRead,
        createdAt: m.createdAt,
      })),
    };
  }

  async sendMessage(conversationId: string, user: User, content?: string, imageUrl?: string) {
    const text = (content || '').trim();
    if (!text && !imageUrl) {
      throw new BadRequestException('Зурвасын агуулга эсвэл зураг оруулна уу.');
    }

    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: {
        listing: true,
        host: true,
        renter: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Харилцан яриа олдсонгүй.');
    }

    if (conversation.renterId !== user.id && conversation.hostId !== user.id) {
      throw new ForbiddenException('Танд энэ чатад зурвас бичих эрх байхгүй байна.');
    }

    const message = this.messageRepo.create({
      conversationId,
      senderId: user.id,
      content: text || (imageUrl ? '📷 Зураг' : ''),
      imageUrl: imageUrl || undefined,
    });
    const savedMessage = await this.messageRepo.save(message);

    // Update conversation state
    conversation.lastMessage = imageUrl ? (text ? `📷 ${text}` : '📷 Зураг илгээсэн') : text;
    conversation.lastMessageSenderId = user.id;
    conversation.lastMessageAt = new Date();

    const isSenderRenter = conversation.renterId === user.id;
    if (isSenderRenter) {
      conversation.hostUnreadCount += 1;
    } else {
      conversation.renterUnreadCount += 1;
    }
    await this.conversationRepo.save(conversation);

    // Notify counterpart via email if they have verified email
    const recipient = isSenderRenter ? conversation.host : conversation.renter;
    if (recipient && recipient.id !== user.id && conversation.listing) {
      this.mailService.sendNewChatMessageNotification(
        recipient,
        user,
        conversation.listing,
        text || '📷 Зураг илгээсэн',
      );
    }

    return {
      id: savedMessage.id,
      conversationId: savedMessage.conversationId,
      senderId: savedMessage.senderId,
      senderName: user.name,
      senderAvatar: user.avatarUrl,
      content: savedMessage.content,
      imageUrl: savedMessage.imageUrl,
      isRead: savedMessage.isRead,
      createdAt: savedMessage.createdAt,
    };
  }

  async getUnreadCount(userId: string) {
    const renterUnreads = await this.conversationRepo
      .createQueryBuilder('c')
      .where('c.renterId = :userId', { userId })
      .select('SUM(c.renterUnreadCount)', 'total')
      .getRawOne();

    const hostUnreads = await this.conversationRepo
      .createQueryBuilder('c')
      .where('c.hostId = :userId', { userId })
      .select('SUM(c.hostUnreadCount)', 'total')
      .getRawOne();

    const total =
      (parseInt(renterUnreads?.total, 10) || 0) +
      (parseInt(hostUnreads?.total, 10) || 0);

    return { unreadCount: total };
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Харилцан яриа олдсонгүй.');
    }

    if (conversation.renterId !== userId && conversation.hostId !== userId) {
      throw new ForbiddenException('Танд энэ чатыг устгах эрх байхгүй байна.');
    }

    // Delete messages first to ensure clean removal
    await this.messageRepo.delete({ conversationId });
    await this.conversationRepo.delete({ id: conversationId });

    return { success: true, message: 'Харилцан яриа амжилттай устгагдлаа.' };
  }

  async deleteMessage(conversationId: string, messageId: string, userId: string) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId, conversationId },
    });

    if (!message) {
      throw new NotFoundException('Зурвас олдсонгүй.');
    }

    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Харилцан яриа олдсонгүй.');
    }

    if (conversation.renterId !== userId && conversation.hostId !== userId) {
      throw new ForbiddenException('Танд энэ чатыг засах эрх байхгүй байна.');
    }

    // Allow deleting message if user is sender or conversation participant
    if (message.senderId !== userId && conversation.hostId !== userId) {
      throw new ForbiddenException('Танд зөвхөн өөрийн илгээсэн зурвасыг устгах эрх байна.');
    }

    await this.messageRepo.delete({ id: messageId });

    // Update conversation lastMessage preview
    const latestMessage = await this.messageRepo.findOne({
      where: { conversationId },
      order: { createdAt: 'DESC' },
    });

    if (latestMessage) {
      conversation.lastMessage = latestMessage.imageUrl
        ? (latestMessage.content ? `📷 ${latestMessage.content}` : '📷 Зураг илгээсэн')
        : latestMessage.content;
      conversation.lastMessageSenderId = latestMessage.senderId;
      conversation.lastMessageAt = latestMessage.createdAt;
    } else {
      conversation.lastMessage = 'Зурвасгүй';
      conversation.lastMessageSenderId = undefined;
    }
    await this.conversationRepo.save(conversation);

    return { success: true, message: 'Зурвас амжилттай устгагдлаа.' };
  }
}
