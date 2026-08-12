import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { FacebookAuthDto } from './dto/facebook-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    googleLogin(googleAuthDto: GoogleAuthDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null | undefined;
        };
    }>;
    facebookLogin(facebookAuthDto: FacebookAuthDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null | undefined;
        };
    }>;
    getProfile(user: any): any;
    updateProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<import("../users/user.entity").User>;
}
