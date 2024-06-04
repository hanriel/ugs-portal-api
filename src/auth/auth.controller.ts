import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiBody({type: CreateUserDto})
    signIn(@Body() signInDto: Record<string, any>) {
      return this.authService.signIn(signInDto.login, signInDto.password);
    }
}
