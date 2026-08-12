import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private googleClient;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null | undefined;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null | undefined;
        };
    }>;
    googleLogin(token: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null | undefined;
        };
    }>;
    facebookLogin(accessToken: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null | undefined;
        };
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("../users/user.entity").User>;
    private generateToken;
}
