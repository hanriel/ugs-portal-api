import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialtyEntity } from './entities/specialty.entity';

@Module({
  providers: [SpecialtiesService],
  controllers: [SpecialtiesController],
  imports: [TypeOrmModule.forFeature([SpecialtyEntity])]
})
export class SpecialtiesModule {}
