import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthProvider } from '../common/enums/auth-provider.enum';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private smsService: SmsService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('oauth.google.clientId') ?? '');
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Энэ имэйл хаяг бүртгэлтэй байна. Өөр имэйл ашиглана уу.');
    }

    if (registerDto.phone) {
      const existingPhone = await this.usersService.findByPhone(registerDto.phone);
      if (existingPhone) {
        throw new BadRequestException('Энэ утасны дугаар бүртгэлтэй байна. Өөр дугаар оруулна уу.');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: false,
      isPhoneVerified: false,
      isVerifiedAgent: false,
      agentVerificationStatus: 'NONE',
    });

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || user.authProvider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна.');
    }

    if (!user.password) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна.');
    }

    return this.generateToken(user);
  }

  async googleLogin(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('oauth.google.clientId') ?? '',
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      let user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        user = await this.usersService.create({
          email: payload.email,
          name: payload.name ?? 'Google User',
          avatarUrl: payload.picture,
          authProvider: AuthProvider.GOOGLE,
          providerId: payload.sub,
          isEmailVerified: true,
        });
      }

      return this.generateToken(user);
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async facebookLogin(accessToken: string) {
    try {
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
      const data = await response.json() as {
        error?: { message: string };
        id: string;
        name: string;
        email: string;
        picture?: { data?: { url?: string } };
      };

      if (data.error) {
        throw new UnauthorizedException('Invalid Facebook token');
      }

      let user = await this.usersService.findByEmail(data.email);
      if (!user) {
        user = await this.usersService.create({
          email: data.email,
          name: data.name,
          avatarUrl: data.picture?.data?.url,
          authProvider: AuthProvider.FACEBOOK,
          providerId: data.id,
          isEmailVerified: true,
        });
      }

      return this.generateToken(user);
    } catch {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }

  async appleLogin(idToken: string, userPayload?: { name?: { firstName?: string; lastName?: string }; email?: string }) {
    try {
      // Decode JWT token payload (Apple ID Token is a signed base64 JWT)
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid Apple token structure');
      }

      const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8')) as {
        sub: string;
        email?: string;
        email_verified?: boolean;
      };

      const email = decoded.email || userPayload?.email;
      if (!email) {
        throw new UnauthorizedException('Apple ID Token does not contain email');
      }

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        const firstName = userPayload?.name?.firstName || '';
        const lastName = userPayload?.name?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Apple User';

        user = await this.usersService.create({
          email,
          name: fullName,
          authProvider: AuthProvider.APPLE,
          providerId: decoded.sub,
          isEmailVerified: true,
        });
      }

      return this.generateToken(user);
    } catch {
      throw new UnauthorizedException('Invalid Apple authentication token');
    }
  }


  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Хэрэглэгч олдсонгүй');
    }

    if (user.phone && this.smsService.isWhitelisted(user.phone) && !user.isPhoneVerified) {
      await this.usersService.update(userId, { isPhoneVerified: true });
      user.isPhoneVerified = true;
    }

    const { password, ...result } = user;
    return {
      ...result,
      avatar: user.avatarUrl,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone);
      if (existingPhone && existingPhone.id !== userId) {
        throw new BadRequestException('Энэ утасны дугаар өөр хэрэглэгчид бүртгэлтэй байна.');
      }
    }

    const updateData: any = { ...dto };
    if (dto.avatar || dto.avatarUrl) {
      updateData.avatarUrl = dto.avatarUrl || dto.avatar;
    }
    delete updateData.avatar;

    if (dto.phone && this.smsService.isWhitelisted(dto.phone)) {
      updateData.isPhoneVerified = true;
    }

    const updatedUser = await this.usersService.update(userId, updateData);
    const { password, ...result } = updatedUser;
    return {
      ...result,
      avatar: updatedUser.avatarUrl,
    };
  }

  async createPhoneSession(userId: string, targetPhone?: string) {
    const user = await this.usersService.findById(userId);
    const phoneToVerify = targetPhone || user?.phone;
    if (!phoneToVerify) {
      throw new BadRequestException('Утасны дугаараа оруулна уу.');
    }
    return this.smsService.createSession(phoneToVerify);
  }

  async checkPhoneSession(userId: string, sessionId: string) {
    const statusData = await this.smsService.checkSessionStatus(sessionId);

    if (statusData.sessionStatus === 'VERIFIED') {
      const updatedUser = await this.usersService.update(userId, {
        phone: statusData.phone,
        isPhoneVerified: true,
      });
      return {
        ...statusData,
        isPhoneVerified: true,
        verifiedPhone: statusData.phone,
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          isPhoneVerified: updatedUser.isPhoneVerified,
        },
        message: 'Утасны дугаар амжилттай баталгаажлаа.',
      };
    }

    return statusData;
  }

  async verifyPhone(userId: string, code?: string, targetPhone?: string) {
    const user = await this.usersService.findById(userId);
    const phoneToSet = targetPhone || user?.phone;

    const updated = await this.usersService.update(userId, {
      ...(phoneToSet ? { phone: phoneToSet } : {}),
      isPhoneVerified: true,
    });

    return {
      success: true,
      message: 'Утасны дугаар амжилттай баталгаажлаа.',
      isPhoneVerified: updated.isPhoneVerified,
      phone: updated.phone,
    };
  }

  async verifyEmail(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.email) {
      throw new BadRequestException('Имэйл хаяг олдсонгүй.');
    }
    const updated = await this.usersService.update(userId, { isEmailVerified: true });
    return {
      success: true,
      message: 'Имэйл хаяг амжилттай баталгаажлаа.',
      isEmailVerified: updated.isEmailVerified,
    };
  }

  async requestAgentVerification(userId: string, data: { agencyName?: string; agentLicenseNo?: string }) {
    const updated = await this.usersService.update(userId, {
      agencyName: data.agencyName,
      agentLicenseNo: data.agentLicenseNo,
      agentVerificationStatus: 'PENDING',
    });
    return {
      success: true,
      message: 'Агент баталгаажуулах хүсэлт амжилттай илгээгдлээ. Админ шалгаж баталгаажуулна.',
      status: updated.agentVerificationStatus,
    };
  }

  async approveAgentVerification(userId: string) {
    const updated = await this.usersService.update(userId, {
      isVerifiedAgent: true,
      agentVerificationStatus: 'VERIFIED',
    });
    return {
      success: true,
      message: 'Агент амжилттай баталгаажлаа.',
      isVerifiedAgent: updated.isVerifiedAgent,
    };
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        subscriptionTier: user.subscriptionTier,
        isVerifiedAgent: user.isVerifiedAgent,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        agentVerificationStatus: user.agentVerificationStatus,
        agencyName: user.agencyName,
        agentLicenseNo: user.agentLicenseNo,
      },
    };
  }
}
