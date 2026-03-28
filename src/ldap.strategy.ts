import * as Strategy from 'passport-ldapauth';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor() {
    super(
      {
        server: {
          url: process.env.LDAP_URL,
          bindDN: process.env.LDAP_BIND_DN,
          bindCredentials: process.env.LDAP_BIND_PW,
          searchBase: process.env.LDAP_SEARCH_BASE,
          searchFilter: '(sAMAccountName={{username}})',
        },
      },
      (req, user, done) => {
        console.log('LDAP Callback reached');
    });
  }

  async validate(user: any, done: Function) {
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    // You can process the user object here (e.g., fetch more details from a local DB)
    console.log('LDAP User:', user);
    done(null, user);
  }
}
