import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { QueryStudentsDto } from './dto/query-students.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findByLogin(username: string) {
    return this.repository.findOneBy({
      username,
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
        role: UserRole.TEACHER,
      }
    });
  }

  async findAllStudents(query: QueryStudentsDto) {
    const { page = 1, limit = 40, search, sortBy, sortOrder = 'asc' } = query;

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.group', 'group')
      .where('user.role = :role', { role: UserRole.STUDENT });

    if (search) {
      queryBuilder.andWhere(
        `(LOWER(user.first_name) LIKE LOWER(:search) OR
          LOWER(user.last_name) LIKE LOWER(:search) OR
          LOWER(user.email) LIKE LOWER(:search))`,
        { search: `%${search}%` }
      );
    }

    // сортировка и пагинация остаются без изменений
    const allowedSortFields = ['first_name', 'last_name', 'email'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(
        `user.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      queryBuilder.orderBy('user.last_name', 'ASC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    return { data, total, totalPages, page, limit };
  }

  findByLdapId(username: any) {
    return this.repository.findOneBy({
      username
    })
  }

  createFromLdap(user: any): any {
    return this.repository.save(user);
  }

  updateFromLdap(user: any, ldapUser: any): any {
    //return this.repository.update(ldapUser);
  }

}
