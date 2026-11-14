import { IsIn, IsString, MinLength } from 'class-validator';

export class SendResetOtpDto {
  @IsIn(['email', 'phone'])
  method: 'email' | 'phone';

  @IsString()
  identifier: string;
}

export class ResetPasswordDto {
  @IsIn(['email', 'phone'])
  method: 'email' | 'phone';

  @IsString()
  identifier: string;

  @IsString()
  @MinLength(4)
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
