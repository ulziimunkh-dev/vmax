"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const auth_provider_enum_1 = require("../common/enums/auth-provider.enum");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    googleClient;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('oauth.google.clientId') ?? '');
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
            authProvider: auth_provider_enum_1.AuthProvider.LOCAL,
        });
        return this.generateToken(user);
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user || user.authProvider !== auth_provider_enum_1.AuthProvider.LOCAL) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.generateToken(user);
    }
    async googleLogin(token) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('oauth.google.clientId') ?? '',
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new common_1.UnauthorizedException('Invalid Google token');
            }
            let user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                user = await this.usersService.create({
                    email: payload.email,
                    name: payload.name ?? 'Google User',
                    avatarUrl: payload.picture,
                    authProvider: auth_provider_enum_1.AuthProvider.GOOGLE,
                    providerId: payload.sub,
                });
            }
            return this.generateToken(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
    }
    async facebookLogin(accessToken) {
        try {
            const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
            const data = await response.json();
            if (data.error) {
                throw new common_1.UnauthorizedException('Invalid Facebook token');
            }
            let user = await this.usersService.findByEmail(data.email);
            if (!user) {
                user = await this.usersService.create({
                    email: data.email,
                    name: data.name,
                    avatarUrl: data.picture?.data?.url,
                    authProvider: auth_provider_enum_1.AuthProvider.FACEBOOK,
                    providerId: data.id,
                });
            }
            return this.generateToken(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid Facebook token');
        }
    }
    async appleLogin(idToken, userPayload) {
        try {
            const parts = idToken.split('.');
            if (parts.length !== 3) {
                throw new common_1.UnauthorizedException('Invalid Apple token structure');
            }
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            const email = decoded.email || userPayload?.email;
            if (!email) {
                throw new common_1.UnauthorizedException('Apple ID Token does not contain email');
            }
            let user = await this.usersService.findByEmail(email);
            if (!user) {
                const firstName = userPayload?.name?.firstName || '';
                const lastName = userPayload?.name?.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim() || 'Apple User';
                user = await this.usersService.create({
                    email,
                    name: fullName,
                    authProvider: auth_provider_enum_1.AuthProvider.APPLE,
                    providerId: decoded.sub,
                });
            }
            return this.generateToken(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid Apple authentication token');
        }
    }
    async updateProfile(userId, dto) {
        const updateData = { ...dto };
        if (dto.avatar && !dto.avatarUrl) {
            updateData.avatarUrl = dto.avatar;
        }
        delete updateData.avatar;
        const updatedUser = await this.usersService.update(userId, updateData);
        const { password, ...result } = updatedUser;
        return {
            ...result,
            avatar: updatedUser.avatarUrl,
        };
    }
    generateToken(user) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatarUrl,
                avatarUrl: user.avatarUrl,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map