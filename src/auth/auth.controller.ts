import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('singin')
    @ApiBody({type: LoginUserDto})
    signIn(@Body() loginInDto: Record<string, any>) {
      return this.authService.loginSSO(loginInDto.login, loginInDto.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('singup')
    @ApiBody({type: CreateUserDto})
    signUp(@Body() signInDto: Record<string, any>) {
      return this.authService.signIn(signInDto.login, signInDto.password);
    }
}
