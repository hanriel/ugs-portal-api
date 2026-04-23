import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumsService } from './curriculums.service';
import { CurriculumsController } from './curriculums.controller';
import { CurriculumEntity } from './entities/curriculum.entity';
import { CurriculumDisciplineEntity } from './entities/curriculum-discipline.entity';
import { DisciplineEntity } from './entities/discipline.entity';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { SpecialtyEntity } from '../specialties/entities/specialty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurriculumEntity,
      CurriculumDisciplineEntity,
      DisciplineEntity,
      AcademicYearEntity,
      SpecialtyEntity,
    ]),
  ],
  controllers: [CurriculumsController],
  providers: [CurriculumsService],
  exports: [CurriculumsService],
})
export class CurriculumsModule {}