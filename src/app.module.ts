import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { RolesModule } from './roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { RoleEntity } from './roles/entities/role.entity';
import { GroupEntity } from './groups/entities/group.entity';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleEnity } from './schedule/entities/schedule.entity';
import { LdapStrategy } from './ldap.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
    }),
    PassportModule.register({ defaultStrategy: 'ldap'}),
    UsersModule,
    GroupsModule,
    RolesModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_BASE,
      entities: [UserEntity, RoleEntity, GroupEntity, ScheduleEnity],
      synchronize: true,
    }),
    AuthModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService, LdapStrategy],
  exports: [PassportModule.register({ defaultStrategy: 'ldap' })],
})
export class AppModule {}
