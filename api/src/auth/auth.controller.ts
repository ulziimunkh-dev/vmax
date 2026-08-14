import { Controller, Post, Body, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { FacebookAuthDto } from './dto/facebook-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  googleLogin(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleLogin(googleAuthDto.token);
  }

  @Post('facebook')
  facebookLogin(@Body() facebookAuthDto: FacebookAuthDto) {
    return this.authService.facebookLogin(facebookAuthDto.accessToken);
  }

  @Post('apple')
  appleLogin(@Body() body: { idToken: string; user?: any }) {
    return this.authService.appleLogin(body.idToken, body.user);
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-phone')
  verifyPhone(@CurrentUser() user: any) {
    return this.authService.verifyPhone(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  verifyEmail(@CurrentUser() user: any) {
    return this.authService.verifyEmail(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('request-agent-verification')
  requestAgentVerification(@CurrentUser() user: any, @Body() body: { agencyName?: string; agentLicenseNo?: string }) {
    return this.authService.requestAgentVerification(user.id, body);
  }
}
