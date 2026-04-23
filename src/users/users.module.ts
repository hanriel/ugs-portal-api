import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { LdapModule } from 'src/ldap/ldap.module';
import { SyncService } from './sync.service';
import { StudentEntity } from './entities/student.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { AdminController } from './admin.controller';

@Module({
  controllers: [UsersController, AdminController],
  providers: [UsersService, SyncService],
  imports: [
    TypeOrmModule.forFeature([UserEntity, StudentEntity, TeacherEntity, GroupEntity]),
    LdapModule
  ],
  exports: [UsersService],
})
export class UsersModule {}
