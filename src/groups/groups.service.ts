import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupEntity } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GroupsService {

  constructor(
    @InjectRepository(GroupEntity)
    private repository: Repository<GroupEntity>,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    return this.repository.insert(createGroupDto);
  }

  findAll() {
    return this.repository.find();
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
