import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { GroupEntity } from './groups/entities/group.entity';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { LdapStrategy } from './ldap.strategy';
import { PassportModule } from '@nestjs/passport';
import { BranchEntity } from './branches/entities/branches.entity';
import { SpecialtiesModule } from './specialties/specialties.module';
import { SpecialtyEntity } from './specialties/entities/specialty.entity';
import { TeacherEntity } from './users/entities/teacher.entity';
import { StudentEntity } from './users/entities/student.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CurriculumsModule } from './curriculums/curriculums.module';
import { CurriculumEntity } from './curriculums/entities/curriculum.entity';
import { AcademicYearEntity } from './curriculums/entities/academic-year.entity';
import { DisciplineEntity } from './curriculums/entities/discipline.entity';
import { CurriculumDisciplineEntity } from './curriculums/entities/curriculum-discipline.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
    }),
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'ldap' }),
    UsersModule,
    BranchesModule,
    GroupsModule,
    CurriculumsModule,
    AuthModule,
    SpecialtiesModule,
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_BASE,
      entities: [UserEntity, TeacherEntity, StudentEntity, GroupEntity, BranchEntity, SpecialtyEntity, CurriculumEntity, AcademicYearEntity, DisciplineEntity, CurriculumDisciplineEntity],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LdapStrategy],
  exports: [PassportModule.register({ defaultStrategy: 'ldap' })],
})
export class AppModule {}
