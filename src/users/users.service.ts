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

  async findByLogin(ldapId: string) {
    return this.repository.findOneBy({
      ldapId,
    })
  }

  async findById(id: number) {
    return this.repository.findOneBy({
      id,
    })
  }

  findAll() {
    return this.repository.find({
      // select: {
      //   id: true,
      //   first_name: true,
      //   last_name: true,
      //   login: true,
      // },
    });
  }

  findAllTeachers() {
    return this.repository.find({
      where: {
        role: {
          id: 2,
        },
      }
    });
  }

  findAllStudents() {
    return this.repository.find({
      where: {
        role: {
          id: 1,
        },
      }
    });
  }

  findByLdapId(ldapId: any) {
    return this.repository.findOneBy({
      ldapId,
    })
  }

  createFromLdap(user: any): any {
    return this.repository.save(user);
  }

  updateFromLdap(user: any, ldapUser: any): any {
    //return this.repository.update(ldapUser);
  }

}
