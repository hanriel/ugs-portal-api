import * as Strategy from 'passport-ldapauth';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor() {
    super({
      server: {
        url: process.env.LDAP_URL,
        bindDN: process.env.LDAP_BIND_DN,
        bindCredentials: process.env.LDAP_BIND_PW,
        searchBase: process.env.LDAP_SEARCH_BASE,
        searchFilter: '(sAMAccountName={{username}})',
      },
      passReqToCallback: true,
    });
  }

  async validate(user: any): Promise<any> {
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
