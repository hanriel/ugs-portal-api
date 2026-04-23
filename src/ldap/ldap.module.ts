// src/ldap/ldap.module.ts
import { Module } from '@nestjs/common';
import { LdapService } from './ldap.service';

@Module({
  providers: [LdapService],
  exports: [LdapService], // Экспортируем, чтобы использовать в других модулях
})
export class LdapModule {}