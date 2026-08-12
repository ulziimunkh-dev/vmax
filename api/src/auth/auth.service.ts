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

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('oauth.google.clientId') ?? '');
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      authProvider: AuthProvider.LOCAL,
    });

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || user.authProvider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
        });
      }

      return this.generateToken(user);
    } catch {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.usersService.update(userId, dto);
  }

  private generateToken(user: { id: string; name: string; email: string; avatarUrl?: string | null }) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
