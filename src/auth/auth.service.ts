import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(login: string, pass: string): Promise<{ access_token: string }> {
      const user = await this.usersService.findByLogin(login);
      if (user?.password !== pass) {
        throw new UnauthorizedException();
      }

      const payload = { sub: user.id, login: user.login };

      return {
          access_token: await this.jwtService.signAsync(payload),
      };
    }

    async loginSSO(login: string, password: string) : Promise<{ id: number, login: string, name: string, access_token: string }>{

      const myUrl = 'https://el.pmkedu.pro/login/index.php'

      const contentRaw = {
        anchor:	"",
        logintoken:	"CuFVHywqEGtV987F1loKjFvdtUBAGvaX",
        username:	"fedoseev_da",
        password:	"forgotCbot2016_2"
      }

      const content  = new FormData();

      for(const name in contentRaw) {
        content.append(name, contentRaw[name]);
      }
      
      const response = await fetch(myUrl, {
        method: 'POST',
        body: content,
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
      });
      
      if (response.status == 303) { console.log(response.body) }
      console.log(response.body)


      const user = await this.usersService.findByLogin(login);
      if (user?.password !== password) {
        throw new UnauthorizedException();
      }

      const payload = { sub: user.id, login: user.login };
      
      return {
        id: user.id,
        login: user.login,
        name: user.first_name + " " + user.last_name,
        access_token: await this.jwtService.signAsync(payload)
      }
    }

}
