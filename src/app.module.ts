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

@Module({
  imports: [
    UsersModule,
    GroupsModule,
    RolesModule,
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '192.168.87.254',
      port: 6033,
      username: 'root',
      password: 'dhQFHz2g',
      database: 'ugs-portal',
      entities: [UserEntity, RoleEntity, GroupEntity],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
