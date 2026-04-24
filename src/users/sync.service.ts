import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { LdapService } from '../ldap/ldap.service';
import { GroupEntity } from '../groups/entities/group.entity';
import { UserEntity } from './entities/user.entity';
import { StudentEntity } from './entities/student.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { UserRole } from './entities/user.entity'; // предполагаем, что enum лежит здесь

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly PROGRESS_BAR_WIDTH = 40;

  constructor(
    private readonly ldapService: LdapService,
    private readonly configService: ConfigService,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(TeacherEntity)
    private readonly teacherRepository: Repository<TeacherEntity>,
  ) {}

  /**
   * Запуск синхронизации по расписанию (каждый день в 3:00)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCronSync() {
    await this.runSync();
  }

  /**
   * Публичный метод для ручного запуска синхронизации
   */
  async runSync(): Promise<{ groups: number; users: number }> {
    this.logger.log('=== LDAP Synchronization started ===');
    const startTime = Date.now();

    try {
      const groupsCount = await this.syncGroups();
      const usersCount = await this.syncUsers();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`=== Synchronization finished in ${duration}s. Groups: ${groupsCount}, Users: ${usersCount} ===`);

      return { groups: groupsCount, users: usersCount };
    } catch (error) {
      this.logger.error(`Synchronization failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private drawProgressBar(current: number, total: number, label: string): void {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    const filled = Math.round((this.PROGRESS_BAR_WIDTH * current) / total);
    const empty = this.PROGRESS_BAR_WIDTH - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r${label} [${bar}] ${percent}% (${current}/${total})`);
  }

  /**
   * Синхронизация учебных групп (OU)
   */
    private async syncGroups(): Promise<number> {
    this.logger.log('→ Synchronizing groups...');
    const base = this.configService.get<string>('LDAP_GROUPS_BASE_DN');
    const filter = '(objectClass=organizationalUnit)';
    const attributes = ['dn', 'ou', 'objectGUID', 'description'];

    const ldapGroups = await this.ldapService.search(base, {
      filter,
      scope: 'sub',
      attributes,
    });

    const totalGroups = ldapGroups.length;
    this.logger.log(`Found ${totalGroups} groups in LDAP`);

    let processedCount = 0;
    const validGroupGuids = new Set<string>();

    for (let i = 0; i < ldapGroups.length; i++) {
      const ldapGroup = ldapGroups[i];
      this.drawProgressBar(i + 1, totalGroups, 'Syncing groups  ');

      try {
        const guidBuffer = this.extractGuid(ldapGroup.objectGUID);
        if (!guidBuffer) {
          continue;
        }
        validGroupGuids.add(guidBuffer.toString('base64'));

        let group = await this.groupRepository.findOne({
          where: { ldapGuid: guidBuffer },
        });

        if (!group) {
          group = this.groupRepository.create();
          group.ldapGuid = guidBuffer;
        }

        group.dn = ldapGroup.dn;
        group.label = ldapGroup.ou || ldapGroup.name || 'Без названия';
        group.isActive = true;

        await this.groupRepository.save(group);
        processedCount++;
      } catch (error) {
        // Ошибки логируем отдельно, чтобы не ломать прогресс-бар
        this.logger.error(`Error processing group ${ldapGroup.dn}: ${error.message}`);
      }
    }
    process.stdout.write('\n'); // перевод строки после прогресс-бара

    // Деактивация отсутствующих групп (без прогресс-бара, т.к. быстро)
    const allActiveGroups = await this.groupRepository.find({ where: { isActive: true } });
    for (const group of allActiveGroups) {
      const guidStr = group.ldapGuid?.toString('base64');
      if (guidStr && !validGroupGuids.has(guidStr)) {
        group.isActive = false;
        await this.groupRepository.save(group);
        this.logger.log(`Marked group ${group.label} as inactive`);
      }
    }

    this.logger.log(`→ Groups synchronized: ${processedCount}`);
    return processedCount;
  }

  /**
   * Синхронизация пользователей с прогресс-баром
   */
  private async syncUsers(): Promise<number> {
    this.logger.log('→ Synchronizing users...');

    const baseDN = this.configService.get<string>('LDAP_SEARCH_BASE');
    const studentsBase = `OU=Students,${baseDN}`;
    const teachersBase = `OU=Teachers,${baseDN}`;

    const attributes = ['dn', 'sAMAccountName', 'displayName', 'mail', 'objectGUID', 'memberOf'];

    // 1. Кэшируем все активные группы в Map (по DN)
    const allGroups = await this.groupRepository.find({ where: { isActive: true } });
    const groupByDn = new Map(allGroups.map(g => [g.dn.toLowerCase(), g]));
    this.logger.log(`Cached ${allGroups.length} groups`);

    // 2. Параллельный поиск студентов и преподавателей
    this.logger.log(`Searching students in ${studentsBase}`);
    const ldapStudentsPromise = this.ldapService.search(studentsBase, {
      filter: '(&(objectClass=user)(objectCategory=person))',
      scope: 'sub',
      attributes,
      paged: { pageSize: 200, pagePause: false }, // увеличиваем размер страницы
    });

    this.logger.log(`Searching teachers in ${teachersBase}`);
    const ldapTeachersPromise = this.ldapService.search(teachersBase, {
      filter: '(&(objectClass=user)(objectCategory=person))',
      scope: 'sub',
      attributes,
      paged: { pageSize: 200, pagePause: false },
    });

    const [ldapStudents, ldapTeachers] = await Promise.all([ldapStudentsPromise, ldapTeachersPromise]);

    const allLdapUsers = [
      ...ldapStudents.map(u => ({ ...u, _role: UserRole.STUDENT })),
      ...ldapTeachers.map(u => ({ ...u, _role: UserRole.TEACHER })),
    ];

    const totalUsers = allLdapUsers.length;
    this.logger.log(`Found ${ldapStudents.length} students and ${ldapTeachers.length} teachers (total: ${totalUsers})`);

    // 3. Загружаем существующих пользователей в кэш по ldapGuid (base64)
    const existingUsers = await this.userRepository.find({ where: { isActive: true } });
    const userCache = new Map<string, UserEntity>();
    for (const u of existingUsers) {
      if (u.ldapGuid) {
        userCache.set(u.ldapGuid.toString('base64'), u);
      }
    }

    // 4. Загружаем существующих студентов в кэш по user id
    const existingStudents = await this.studentRepository.find({ relations: ['group'] });
    const studentCache = new Map<number, StudentEntity>();
    for (const s of existingStudents) {
      studentCache.set(s.id, s);
    }

    const BATCH_SIZE = 200;
    const usersToSave: UserEntity[] = [];
    const studentsToSave: StudentEntity[] = [];
    const teachersToSave: TeacherEntity[] = [];
    const validUserGuids = new Set<string>();

    let processedCount = 0;

    // 5. Основной цикл обработки
    for (let i = 0; i < allLdapUsers.length; i++) {
      const ldapUser = allLdapUsers[i];
      this.drawProgressBar(i + 1, totalUsers, 'Syncing users   ');

      try {
        if (ldapUser.sAMAccountName?.endsWith('$')) continue;

        const guidBuffer = this.extractGuid(ldapUser.objectGUID);
        if (!guidBuffer) continue;

        const guidKey = guidBuffer.toString('base64');
        validUserGuids.add(guidKey);

        const role = ldapUser._role;

        // Берём из кэша или создаём нового
        let user = userCache.get(guidKey);
        if (!user) {
          user = this.userRepository.create();
          user.ldapGuid = guidBuffer;
          user.role = role;
          userCache.set(guidKey, user); // добавляем в кэш для возможных дубликатов
          
        } else if (user.role !== role) {
          user.role = role;
        }

        if (!ldapUser.dn) {
          this.logger.warn(`User ${ldapUser.sAMAccountName} has no DN, skipping.`);
          console.dir(ldapUser, { depth: 3 });
          continue;
        }

        user.dn = ldapUser.dn || '';
        user.username = ldapUser.sAMAccountName;

        // Разбор displayName на first_name и last_name
        const displayName = ldapUser.displayName || '';
        const nameParts = displayName.split(' ');
        user.last_name = nameParts[0] || '';
        user.first_name = nameParts[1] || '';
        user.middle_name = nameParts[2] || '';

        user.email = ldapUser.mail || null;
        user.isActive = true;
        

        usersToSave.push(user);

        // Обработка роли
        if (role === UserRole.STUDENT) {
          const groupDn = (await this.findStudentGroup(ldapUser)).dn;
          if (groupDn) {
            const group = groupByDn.get(groupDn.toLowerCase());
            if (group) {
              let student = studentCache.get(user.id);
              if (!student) {
                student = this.studentRepository.create();
                student.id = user.id;
                studentCache.set(user.id, student);
              }
              student.group = group;
              student.groupId = group.id;
              studentsToSave.push(student);
            } else {
              this.logger.debug(`Group not found for DN: ${groupDn}`);
            }
          } else {
            this.logger.debug(`No group DN found for student ${user.username}`);
          }
        } else if (role === UserRole.TEACHER) {
          let teacher = await this.teacherRepository.findOne({ where: { id: user.id } });
          if (!teacher) {
            teacher = this.teacherRepository.create();
            teacher.id = user.id;
          }
          // Обновите поля преподавателя при необходимости
          teachersToSave.push(teacher);
        }

        processedCount++;

        // Сохраняем пачками
        if (usersToSave.length >= BATCH_SIZE) {
          await this.userRepository.save(usersToSave);
          usersToSave.length = 0;
        }
        if (studentsToSave.length >= BATCH_SIZE) {
          await this.studentRepository.save(studentsToSave);
          studentsToSave.length = 0;
        }
        if (teachersToSave.length >= BATCH_SIZE) {
          await this.teacherRepository.save(teachersToSave);
          teachersToSave.length = 0;
        }
      } catch (error) {
        this.logger.error(`Error processing ${allLdapUsers[i].sAMAccountName}: ${error.message}`);
      }
    }

    // Сохраняем остатки
    if (usersToSave.length) await this.userRepository.save(usersToSave);
    if (studentsToSave.length) await this.studentRepository.save(studentsToSave);
    if (teachersToSave.length) await this.teacherRepository.save(teachersToSave);

    process.stdout.write('\n');

    // Деактивация отсутствующих пользователей
    const allActiveUsers = await this.userRepository.find({ where: { isActive: true } });
    for (const user of allActiveUsers) {
      const guidStr = user.ldapGuid?.toString('base64');
      if (guidStr && !validUserGuids.has(guidStr)) {
        user.isActive = false;
        await this.userRepository.save(user);
        this.logger.log(`Marked user ${user.username} as inactive`);
      }
    }

    this.logger.log(`→ Users synchronized: ${processedCount}`);
    return processedCount;
  }

  /**
   * Синхронизация сущности StudentEntity
   */
  private async syncStudentEntity(user: UserEntity, ldapUser: any): Promise<void> {
    let student = await this.studentRepository.findOne({ where: { id: user.id } });

    if (!student) {
      student = this.studentRepository.create();
      student.id = user.id;
      this.logger.debug(`Creating StudentEntity for ${user.username}`);
    }

    // Определяем группу студента
    const group = await this.findStudentGroup(ldapUser);
    if (group) {
      student.group = group;
      student.groupId = group.id;
    } else {
      this.logger.warn(`Could not find group for student ${user.username}`);
    }

    // Поля, специфичные для студента (birthDate, phoneNumber), не трогаем — они заполняются вручную
    await this.studentRepository.save(student);
  }

  /**
   * Синхронизация сущности TeacherEntity
   */
  private async syncTeacherEntity(user: UserEntity): Promise<void> {
    let teacher = await this.teacherRepository.findOne({ where: { id: user.id } });

    if (!teacher) {
      teacher = this.teacherRepository.create();
      teacher.id = user.id;
      this.logger.debug(`Creating TeacherEntity for ${user.username}`);
    }

    // Здесь можно обновить поля преподавателя, если они приходят из LDAP
    // Например: кафедра (department), учёная степень (degree) и т.д.

    await this.teacherRepository.save(teacher);
  }

  /**
   * Поиск группы студента по memberOf
   */
  private async findStudentGroup(ldapUser: any): Promise<GroupEntity | null> {
    const memberOf = ldapUser.memberOf;
    if (!memberOf || memberOf.length === 0) {
      return null;
    }

    // Ищем группу, DN которой соответствует одному из значений memberOf
    // Предполагаем, что в DN группы содержится OU=Groups или что-то подобное
    const groupBase = this.configService.get<string>('LDAP_GROUPS_BASE_DN').toLowerCase();

    for (const groupDn of memberOf) {
      const lowerDn = groupDn.toLowerCase();
      // Проверяем, что DN группы находится в нужной ветке
      if (lowerDn.includes(groupBase) || lowerDn.includes('ou=groups')) {
        const group = await this.groupRepository.findOne({ where: { dn: groupDn } });
        if (group) {
          return group;
        }
      }
    }

    // Запасной вариант: ищем по OU, в котором находится пользователь
    const userOu = this.extractParentOU(ldapUser.dn);
    if (userOu) {
      const group = await this.groupRepository.findOne({ where: { dn: userOu } });
      if (group) return group;
    }

    return null;
  }

  /**
   * Определение роли пользователя на основе DN
   */
  private determineRole(dn: string): UserRole | null {
    const lowerDn = dn.toLowerCase();
    if (lowerDn.includes('ou=students')) {
      return UserRole.STUDENT;
    }
    if (lowerDn.includes('ou=teachers') || lowerDn.includes('ou=преподаватели')) {
      return UserRole.TEACHER;
    }
    // Можно добавить другие проверки (например, по группам безопасности)
    return null;
  }

  /**
   * Извлечение objectGUID в виде Buffer
   */
private extractGuid(guid: any): Buffer | null {
  if (!guid) {
    this.logger.debug('extractGuid: received null/undefined');
    return null;
  }

  // 1. Уже Buffer
  if (Buffer.isBuffer(guid)) {
    this.logger.debug(`extractGuid: already Buffer, length=${guid.length}`);
    return guid;
  }

  // 2. Строка
  if (typeof guid === 'string') {

    // Сначала попробуем интерпретировать как бинарные данные (Latin-1)
    const binaryBuffer = Buffer.from(guid, 'binary');

    // objectGUID в Active Directory должен быть 16 байт, но на всякий случай примем любой разумный буфер
    if (binaryBuffer.length >= 8) {
      // Возвращаем как есть, даже если длина не ровно 16 — возможно, какие-то нестандартные GUID
      return binaryBuffer;
    }

    // Если бинарный буфер слишком короткий, пробуем Base64
    try {
      const base64Buffer = Buffer.from(guid, 'base64');
        this.logger.debug(`Base64 buffer length: ${base64Buffer.length}`);
      if (base64Buffer.length >= 8) {
        return base64Buffer;
      }
    } catch {
      // игнорируем
    }

    // Если ничего не подошло — возвращаем null и детализируем причину
    this.logger.warn(`extractGuid: string could not be converted to a valid buffer. ` +
      `String preview: ${guid.substring(0, 50)}`);
    return null;
  }

  // 3. Массив байт
  if (Array.isArray(guid)) {
    this.logger.debug(`extractGuid: array of length ${guid.length}`);
    return Buffer.from(guid);
  }

  this.logger.warn(`Unsupported GUID format: ${typeof guid}`);
  return null;
}

  /**
   * Извлечение родительского OU из DN
   */
  private extractParentOU(dn: string): string | null {
    const parts = dn.split(',').map(p => p.trim());
    // Ищем часть, начинающуюся с OU=
    const ouPart = parts.find(p => p.toLowerCase().startsWith('ou='));
    if (!ouPart) return null;

    // Возвращаем DN, начиная с этого OU
    const index = parts.indexOf(ouPart);
    return parts.slice(index).join(',');
  }
}