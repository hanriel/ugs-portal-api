import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchEntity } from './entities/branches.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialtyEntity } from 'src/specialties/entities/specialty.entity';
import { GroupEntity } from 'src/groups/entities/group.entity';

@Injectable()
export class BranchesService {

  constructor(
    @InjectRepository(BranchEntity)
    private repository: Repository<BranchEntity>,
  ) {}

  create(createBranchDto: CreateBranchDto) {
    return this.repository.insert(createBranchDto);
  }

  async findAll() {
    const raw = await this.repository
    .createQueryBuilder('branch')
    .leftJoin('branch.supervisor', 'supervisor')
    .select([
      'branch.id',
      'branch.name',
      'supervisor.id',
      'supervisor.first_name',
      'supervisor.last_name',
      'supervisor.middle_name',
    ])
    .addSelect((subQuery) => {
      return subQuery
        .select('COUNT(specialty.id)')
        .from(SpecialtyEntity, 'specialty')
        .where('specialty.branch_id = branch.id');
    }, 'specialtiesCount')
    .addSelect((subQuery) => {
      return subQuery
        .select('COUNT(group.id)')
        .from(GroupEntity, 'group')
        .innerJoin('group.specialty', 'specialty')
        .where('specialty.branch_id = branch.id');
    }, 'groupsCount')
    .getRawMany();

  // Преобразование сырых данных в нужную структуру
  return raw.map((row) => ({
    id: row.branch_id,
    name: row.branch_name,
    supervisor: {
      id: row.supervisor_id,
      first_name: row.supervisor_first_name,
      last_name: row.supervisor_last_name,
      middle_name: row.supervisor_middle_name,
    },
    specialtiesCount: Number(row.specialtiesCount) || 0,
    groupsCount: Number(row.groupsCount) || 0,
  }));
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
