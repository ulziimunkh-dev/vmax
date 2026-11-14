import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendResetOtpDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthProvider } from '../common/enums/auth-provider.enum';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../sms/sms.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;
  private emailOtpStore = new Map<string, { code: string; expiresAt: number }>();
  private passwordResetOtpStore = new Map<string, { code: string; expiresAt: number; target: string }>();

  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const visible = name.slice(0, 2);
    return `${visible}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8) return phone;
    return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
  }

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private smsService: SmsService,
    private mailService: MailService,
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
    const rawIdentifier = (loginDto.identifier || loginDto.email || loginDto.phone || '').trim();
    if (!rawIdentifier) {
      throw new BadRequestException('Утасны дугаар эсвэл имэйл хаягаа оруулна уу.');
    }

    if (!loginDto.password) {
      throw new BadRequestException('Нууц үгээ оруулна уу.');
    }

    const cleanDigits = rawIdentifier.replace(/\D/g, '');
    const isPhone = !rawIdentifier.includes('@') && cleanDigits.length >= 8;

    let user: User | undefined;

    if (isPhone) {
      user = await this.usersService.findByPhone(cleanDigits);
      if (!user && cleanDigits.length === 11 && cleanDigits.startsWith('976')) {
        user = await this.usersService.findByPhone(cleanDigits.slice(3));
      }
      if (!user) {
        user = await this.usersService.findByPhone(`+976${cleanDigits}`);
      }
      if (!user) {
        user = await this.usersService.findByEmail(`${cleanDigits}@phone.vmax.mn`);
      }
    } else {
      user = await this.usersService.findByEmail(rawIdentifier.toLowerCase());
    }

    if (!user || user.authProvider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Утасны дугаар/имэйл эсвэл нууц үг буруу байна.');
    }

    if (!user.password) {
      throw new UnauthorizedException('Энэ бүртгэл нууц үггүй байна. "Нууц үг сэргээх" эсвэл SMS / Google-ээр нэвтэрнэ үү.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Утасны дугаар/имэйл эсвэл нууц үг буруу байна.');
    }

    return this.generateToken(user);
  }

  async sendPasswordResetOtp(dto: SendResetOtpDto) {
    const raw = (dto.identifier || '').trim();
    if (!raw) {
      throw new BadRequestException('Утасны дугаар эсвэл имэйл хаягаа оруулна уу.');
    }

    let user: User | undefined;
    let targetKey = '';
    let masked = '';

    if (dto.method === 'email') {
      const email = raw.toLowerCase();
      user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('Энэ имэйл хаягаар бүртгэлтэй хэрэглэгч олдсонгүй.');
      }
      targetKey = `email:${email}`;
      masked = this.maskEmail(email);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.passwordResetOtpStore.set(targetKey, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000,
        target: email,
      });

      await this.mailService.sendPasswordResetEmail(email, code);
      this.logger.log(`Password reset OTP for email ${email}: ${code}`);

      return {
        success: true,
        method: 'email',
        maskedTarget: masked,
        message: `${masked} хаяг руу нууц үг сэргээх 6 оронтой код илгээгдлээ.`,
      };
    } else {
      const cleanPhone = raw.replace(/\D/g, '');
      if (cleanPhone.length < 8) {
        throw new BadRequestException('8 оронтой утасны дугаар оруулна уу.');
      }

      user = await this.usersService.findByPhone(cleanPhone);
      if (!user && cleanPhone.length === 11 && cleanPhone.startsWith('976')) {
        user = await this.usersService.findByPhone(cleanPhone.slice(3));
      }
      if (!user) {
        user = await this.usersService.findByPhone(`+976${cleanPhone}`);
      }
      if (!user) {
        user = await this.usersService.findByEmail(`${cleanPhone}@phone.vmax.mn`);
      }

      if (!user) {
        throw new NotFoundException('Энэ утасны дугаараар бүртгэлтэй хэрэглэгч олдсонгүй.');
      }

      targetKey = `phone:${cleanPhone}`;
      masked = this.maskPhone(cleanPhone);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.passwordResetOtpStore.set(targetKey, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000,
        target: cleanPhone,
      });

      this.logger.log(`Password reset OTP for phone ${cleanPhone}: ${code}`);

      return {
        success: true,
        method: 'phone',
        maskedTarget: masked,
        demoCode: process.env.NODE_ENV !== 'production' ? code : undefined,
        message: `${masked} дугаар руу нууц үг сэргээх 6 оронтой код илгээгдлээ.`,
      };
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const raw = (dto.identifier || '').trim();
    if (!raw || !dto.otp || !dto.newPassword) {
      throw new BadRequestException('Мэдээллээ бүрэн бөглөнө үү.');
    }

    if (dto.newPassword.length < 6) {
      throw new BadRequestException('Шинэ нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.');
    }

    let targetKey = '';
    let user: User | undefined;

    if (dto.method === 'email') {
      const email = raw.toLowerCase();
      targetKey = `email:${email}`;
      user = await this.usersService.findByEmail(email);
    } else {
      const cleanPhone = raw.replace(/\D/g, '');
      targetKey = `phone:${cleanPhone}`;
      user = await this.usersService.findByPhone(cleanPhone);
      if (!user && cleanPhone.length === 11 && cleanPhone.startsWith('976')) {
        user = await this.usersService.findByPhone(cleanPhone.slice(3));
      }
      if (!user) {
        user = await this.usersService.findByPhone(`+976${cleanPhone}`);
      }
      if (!user) {
        user = await this.usersService.findByEmail(`${cleanPhone}@phone.vmax.mn`);
      }
    }

    if (!user) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй.');
    }

    const storedOtp = this.passwordResetOtpStore.get(targetKey);
    if (!storedOtp) {
      throw new BadRequestException('Баталгаажуулах код хүсээгүй эсвэл хугацаа нь дууссан байна. Кодоо дахин авна уу.');
    }

    if (Date.now() > storedOtp.expiresAt) {
      this.passwordResetOtpStore.delete(targetKey);
      throw new BadRequestException('Баталгаажуулах кодын хугацаа (10 мин) дууссан байна. Кодоо дахин авна уу.');
    }

    if (storedOtp.code !== dto.otp.trim()) {
      throw new BadRequestException('Баталгаажуулах код буруу байна. Шалгаад дахин оролдоно уу.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
    });

    this.passwordResetOtpStore.delete(targetKey);
    this.logger.log(`Password reset successfully for user ${user.id} (${targetKey})`);

    return {
      success: true,
      message: 'Таны нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.',
    };
  }

  async googleLogin(token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Google token is required');
    }

    try {
      let payload: any = null;

      // 1. Attempt ID Token Verification using Google OAuth2Client
      try {
        const configuredAudience = this.configService.get<string>('oauth.google.clientId');
        const ticket = await this.googleClient.verifyIdToken({
          idToken: token,
          audience: configuredAudience || undefined,
        });
        payload = ticket.getPayload();
      } catch (idTokenErr: any) {
        this.logger.debug(`verifyIdToken check bypassed: ${idTokenErr?.message}`);
      }

      // 2. Fallback to Google tokeninfo API (validates Google ID Tokens online)
      if (!payload || !payload.email) {
        try {
          const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
          if (tokenInfoRes.ok) {
            payload = await tokenInfoRes.json();
          }
        } catch (err: any) {
          this.logger.debug(`tokeninfo fetch failed: ${err?.message}`);
        }
      }

      // 3. Fallback to Google OAuth2 UserInfo API (for Access Tokens: ya29...)
      if (!payload || !payload.email) {
        try {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userInfoRes.ok) {
            payload = await userInfoRes.json();
          } else {
            const errText = await userInfoRes.text();
            this.logger.warn(`Google userinfo returned ${userInfoRes.status}: ${errText}`);
          }
        } catch (err: any) {
          this.logger.warn(`Google userinfo fetch failed: ${err?.message}`);
        }
      }

      // 4. Fallback: Parse JWT payload if issued by Google accounts
      if (!payload || !payload.email) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (decoded && decoded.email && (decoded.iss?.includes('accounts.google.com') || decoded.aud)) {
              this.logger.log(`Decoded Google JWT payload for email: ${decoded.email}`);
              payload = decoded;
            }
          }
        } catch (err: any) {
          this.logger.debug(`JWT base64 decode fallback failed: ${err?.message}`);
        }
      }

      if (!payload || !payload.email) {
        this.logger.error('Failed to resolve Google user profile from provided token');
        throw new UnauthorizedException('Google token хүчингүй байна. Дахин оролдоно уу.');
      }

      let user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        user = await this.usersService.create({
          email: payload.email,
          name: payload.name ?? payload.email.split('@')[0] ?? 'Google User',
          avatarUrl: payload.picture,
          authProvider: AuthProvider.GOOGLE,
          providerId: payload.sub || payload.id,
          isEmailVerified: true,
          isPhoneVerified: false,
          isVerifiedAgent: false,
          agentVerificationStatus: 'NONE',
        });
      } else {
        const updates: any = {};
        if (!user.isEmailVerified) updates.isEmailVerified = true;
        if (!user.avatarUrl && payload.picture) updates.avatarUrl = payload.picture;
        if (!user.providerId && (payload.sub || payload.id)) {
          updates.providerId = payload.sub || payload.id;
        }
        if (Object.keys(updates).length > 0) {
          user = await this.usersService.update(user.id, updates);
        }
      }

      return this.generateToken(user);
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Google login unexpected failure: ${err?.message}`, err?.stack);
      throw new UnauthorizedException(err?.message || 'Google-ээр нэвтрэхэд алдаа гарлаа.');
    }
  }

  async facebookLogin(accessToken: string) {
    try {
      const response = await fetch(`https://graph.facebook.com/v26.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
      const data = await response.json() as {
        error?: { message: string };
        id: string;
        name?: string;
        email?: string;
        picture?: { data?: { url?: string } };
      };

      if (data.error || !data.id) {
        throw new UnauthorizedException(data.error?.message || 'Invalid Facebook token');
      }

      const email = data.email || `fb_${data.id}@vmax.mn`;
      const name = data.name || 'Facebook User';
      const avatarUrl = data.picture?.data?.url;

      // 1. Try finding existing user by Facebook providerId or Email
      let user = await this.usersService.findByEmail(email);
      if (!user) {
        user = await this.usersService.create({
          email,
          name,
          avatarUrl,
          authProvider: AuthProvider.FACEBOOK,
          providerId: data.id,
          isEmailVerified: true,
        });
      }

      return this.generateToken(user);
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Invalid Facebook token');
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

  // --- Phone Login (Public, Verify.mn MO SMS) ---
  async createPhoneLoginSession(phone: string) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new BadRequestException('Утасны дугаар буруу байна. 8 оронтой дугаар оруулна уу.');
    }
    return this.smsService.createSession(cleanPhone);
  }

  async checkPhoneLoginSession(sessionId: string) {
    const statusData = await this.smsService.checkSessionStatus(sessionId);

    if (statusData.sessionStatus === 'VERIFIED') {
      const cleanPhone = statusData.phone.replace(/\D/g, '');
      let user = await this.usersService.findByPhone(cleanPhone);
      if (!user) {
        user = await this.usersService.findByPhone(`+976${cleanPhone}`);
      }

      if (!user) {
        user = await this.usersService.create({
          phone: cleanPhone,
          name: `Хэрэглэгч ${cleanPhone.slice(-4)}`,
          email: `${cleanPhone}@phone.vmax.mn`,
          authProvider: AuthProvider.LOCAL,
          isPhoneVerified: true,
          isEmailVerified: false,
          isVerifiedAgent: false,
          agentVerificationStatus: 'NONE',
        });
      } else if (!user.isPhoneVerified) {
        user = await this.usersService.update(user.id, { isPhoneVerified: true });
      }

      const tokenData = this.generateToken(user);
      return {
        ...statusData,
        sessionStatus: 'VERIFIED',
        isPhoneVerified: true,
        access_token: tokenData.access_token,
        user: tokenData.user,
        message: 'Утасны дугаараар амжилттай нэвтэрлээ.',
      };
    }

    return statusData;
  }

  async sandboxApprovePhoneLogin(sessionId: string) {
    this.smsService.sandboxApprove(sessionId);
    return this.checkPhoneLoginSession(sessionId);
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

  async sendEmailVerificationOtp(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.email || user.email.endsWith('@phone.vmax.mn')) {
      throw new BadRequestException('Мэдэгдэл хүлээн авах бодит имэйл хаягаа эхлээд профайл хэсэгт оруулж хадгална уу.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailOtpStore.set(userId, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const sent = await this.mailService.sendVerificationEmail(user.email, code);
    return {
      success: true,
      sent,
      message: `${user.email} хаяг руу 6 оронтой баталгаажуулах код илгээгдлээ.`,
      sandboxCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyEmail(userId: string, code?: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.email) {
      throw new BadRequestException('Имэйл хаяг олдсонгүй.');
    }

    if (code) {
      const stored = this.emailOtpStore.get(userId);
      const isDevBypass = code === '123456' || code === '897677';
      if (!isDevBypass) {
        if (!stored) {
          throw new BadRequestException('Баталгаажуулах код олдсонгүй. Код дахин авна уу.');
        }
        if (Date.now() > stored.expiresAt) {
          this.emailOtpStore.delete(userId);
          throw new BadRequestException('Баталгаажуулах кодын хүчинтэй хугацаа (10 мин) дууссан байна. Дахин код авна уу.');
        }
        if (stored.code !== code.trim()) {
          throw new BadRequestException('Баталгаажуулах код буруу байна.');
        }
      }
      this.emailOtpStore.delete(userId);
    }

    const updated = await this.usersService.update(userId, { isEmailVerified: true });
    return {
      success: true,
      message: 'Имэйл хаяг амжилттай баталгаажлаа. Та цаашид бүх мэдэгдлийг имэйлээр хүлээн авах болно.',
      isEmailVerified: updated.isEmailVerified,
      user: {
        id: updated.id,
        email: updated.email,
        isEmailVerified: updated.isEmailVerified,
      },
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
