import { Injectable } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-specialty.dto';
import { SpecialtyEntity } from './entities/specialty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateSpecialityDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {

  constructor(
      @InjectRepository(SpecialtyEntity)
      private repository: Repository<SpecialtyEntity>,
    ) {}
  
    create(createSpecialityDto: CreateSpecialityDto) {
      return this.repository.insert(createSpecialityDto);
    }
  
    findAll() {
      return this.repository.find();
    }
  
    findOne(id: number) {
      return this.repository.findOneBy({ id: id })
    }
  
    update(id: number, updateSpecialityDto: UpdateSpecialityDto) {
      return this.repository.update(id, updateSpecialityDto)
    }
  
    remove(id: number) {
      return `Это действие удаляет #${id} отделение`;
    }

}
