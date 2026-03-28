import { Injectable } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-specialty.dto';
import { SpecialtyEntity } from './entities/specialty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SpecialtiesService {

  constructor(
      @InjectRepository(SpecialtyEntity)
      private repository: Repository<SpecialtyEntity>,
    ) {}
  
    create(createBranchDto: CreateSpecialityDto) {
      return this.repository.insert(createBranchDto);
    }
  
    findAll() {
      return this.repository.find();
    }
  
    findOne(id: number) {
      return this.repository.findOneBy({ id: id })
    }
  
    update(id: number, updateBranchDto: CreateSpecialityDto) {
      return this.repository.update(id, updateBranchDto)
    }
  
    remove(id: number) {
      return `Это действие удаляет #${id} отделение`;
    }

}
