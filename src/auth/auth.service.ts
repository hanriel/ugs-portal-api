import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(ldapUser: any) {

    // 2. Поиск в локальной БД по ldapId
    let user = await this.userService.findByLogin(ldapUser.sAMAccountName);
    
    if (!user) {
      const newUser = {
        ldapId: ldapUser.sAMAccountName,
        last_name: ldapUser.name.split(' ')[0],
        first_name: ldapUser.name.split(' ')[1],
        middle_name: ldapUser.name.split(' ')[2],
        dn: ldapUser.dn,
        username: ldapUser.sAMAccountName,
        role: UserRole.TEACHER,
      };
      user = await this.userService.createFromLdap(newUser);
    } else {
      user = await this.userService.updateFromLdap(user, ldapUser);
    }

    const payload = {
      sub: ldapUser.id,
      role: ldapUser.role,
      username: ldapUser.sAMAccountName,
      name: ldapUser.givenName,
      email: ldapUser.mail,
    };
    return {
      user: {
        id: ldapUser.sAMAccountName,
        fullName: ldapUser.name,
        email: ldapUser.mail,
        role: ldapUser.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
