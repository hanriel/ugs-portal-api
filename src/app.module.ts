import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    UsersModule,
    GroupsModule,
    RolesModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'ugd_user',
      password: 'dhQFHz2g',
      database: 'ugs-portal',
      entities: [UserEntity, RoleEntity, GroupEntity, ScheduleEnity],
      synchronize: true,
    }),
    AuthModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
