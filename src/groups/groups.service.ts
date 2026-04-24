import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupEntity } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ldap from 'ldapjs';

@Injectable()
export class GroupsService {

  constructor(
    @InjectRepository(GroupEntity)
    private repository: Repository<GroupEntity>,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    return this.repository.insert(createGroupDto);
  }


  async findAll() {
    const raw = await this.repository
      .createQueryBuilder('group')
      .leftJoin('group.curator', 'curator')
      .leftJoin('group.students', 'student')
      .select([
        'group.id',
        'group.label',
        'group.labelRU',
        'curator.id',
        'curator.first_name',
        'curator.last_name',
        'curator.middle_name',
      ])
      .addSelect('COUNT(student.id)', 'studentCount')
      .groupBy('group.id, curator.id')
      .getRawMany();

    return raw.map(row => ({
      id: row.group_id,
      label: row.group_label,
      labelRU: row.group_labelRU,
      curator: {
        id: row.curator_id,
        first_name: row.curator_first_name,
        last_name: row.curator_last_name,
        middle_name: row.curator_middle_name,
      },
      studentCount: Number(row.studentCount),
    }));
  }

  findOne(id: number) {
    return this.repository.findOneBy({ id: id })
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return this.repository.update(id, updateGroupDto)
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
  
}
