import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleEnity } from './entities/schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {

  constructor(
    @InjectRepository(ScheduleEnity)
    private repository: Repository<ScheduleEnity>,
  ) {}

  create(createScheduleDto: CreateScheduleDto) {
    return 'This action adds a new schedule';
  }

  findAll() {
    return this.repository.find({
      relations: {
        group_id: true
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} schedule`;
  }

  update(id: number, updateScheduleDto: UpdateScheduleDto) {
    return `This action updates a #${id} schedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} schedule`;
  }
}
