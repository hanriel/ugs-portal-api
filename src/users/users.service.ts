import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findByLogin(login: string) {
    return this.repository.findOneBy({
      login,
    })
  }

  async findById(id: number) {
    return this.repository.findOneBy({
      id,
    })
  }

  create(dto: CreateUserDto) {
    // return this.repository.save(dto)
  }

}
