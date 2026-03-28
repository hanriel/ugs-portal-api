import { Request, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import passport from 'passport';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('ldap'))
  @Post('login')
  @ApiBody({ type: LoginUserDto })
  signIn(@Request() req) {
    passport.authenticate('ldap', { session: false });
    return this.authService.login(req.user);
  }
}
