import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchEntity } from './entities/branches.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BranchesService {

  constructor(
    @InjectRepository(BranchEntity)
    private repository: Repository<BranchEntity>,
  ) {}

  create(createBranchDto: CreateBranchDto) {
    return this.repository.insert(createBranchDto);
  }

  findAll() {
    return this.repository.find({
      select: {
        id: true,
        name: true,
        supervisor: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      relations: {
        supervisor: true,
      },
    });
  }

  findOne(id: number) {
    return this.repository.findOneBy({ id: id })
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return this.repository.update(id, updateBranchDto)
  }

  remove(id: number) {
    return `Это действие удаляет #${id} отделение`;
  }
}
