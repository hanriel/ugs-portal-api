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

  findAll() {
    return this.repository.find({
      select: {
        id: true,
        label: true,
        curator: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      relations: {
        curator: true,
      },
    });
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

  async getOUList(baseDN: string): Promise<string[]> {
    let client = ldap.createClient({
      url: process.env.LDAP_URL,
    });

    return new Promise((resolve, reject) => {
      // 1. Привязка (Bind) с правами администратора или сервисного аккаунта
      client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PW, (err) => {
        if (err) return reject(err);

        const ous: string[] = [];
        const searchOptions: ldap.SearchOptions = {
          filter: '(objectClass=organizationalUnit)',
          scope: 'sub',
          attributes: ['dn', 'OU'],
        };

        // 2. Выполнение поиска
        client.search(baseDN, searchOptions, (searchErr, res) => {
          if (searchErr) return reject(searchErr);

          res.on('searchEntry', (entry) => {
            const ouAttribute = entry.attributes.find(a => a.type === 'ou');
            const ouName = ouAttribute ? ouAttribute.vals[0] : null;
            ous.push(ouName);
          });

          res.on('error', (error) => {
            reject(error);
          });

          res.on('end', () => {
            resolve(ous);
          });
        });
      });
    });
  }

}
