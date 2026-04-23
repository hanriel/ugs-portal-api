import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CurriculumEntity } from './entities/curriculum.entity';
import { AttestationType, CurriculumDisciplineEntity } from './entities/curriculum-discipline.entity';
import { DisciplineEntity } from './entities/discipline.entity';
import { SpecialtyEntity } from '../specialties/entities/specialty.entity';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { QueryCurriculumDto } from './dto/query-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(CurriculumEntity)
    private curriculumRepository: Repository<CurriculumEntity>,
    @InjectRepository(CurriculumDisciplineEntity)
    private cdRepository: Repository<CurriculumDisciplineEntity>,
    @InjectRepository(DisciplineEntity)
    private disciplineRepository: Repository<DisciplineEntity>,
    @InjectRepository(SpecialtyEntity)
    private specialtyRepository: Repository<SpecialtyEntity>,
    @InjectRepository(AcademicYearEntity)
    private yearRepository: Repository<AcademicYearEntity>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateCurriculumDto): Promise<CurriculumEntity> {
    // Проверка существования связанных сущностей
    const specialty = await this.specialtyRepository.findOneBy({ id: dto.specialtyId });
    if (!specialty) throw new BadRequestException('Specialty not found');

    const academicYear = await this.yearRepository.findOneBy({ id: dto.academicYearId });
    if (!academicYear) throw new BadRequestException('Academic year not found');

    // Проверка, что для этой специальности и года набора ещё нет активного плана
    const existing = await this.curriculumRepository.findOne({
      where: {
        specialtyId: dto.specialtyId,
        yearOfAdmission: dto.yearOfAdmission,
        isActive: true,
      },
    });
    if (existing) throw new BadRequestException('Active curriculum already exists for this specialty and year');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Создаём план
      const curriculum = this.curriculumRepository.create({
        name: dto.name,
        specialtyId: dto.specialtyId,
        academicYearId: dto.academicYearId,
        yearOfAdmission: dto.yearOfAdmission,
        isActive: dto.isActive ?? true,
      });
      const savedCurriculum = await queryRunner.manager.save(curriculum);

      // Создаём дисциплины плана
      const cdEntities = await Promise.all(
        dto.disciplines.map(async (item) => {
          const discipline = await this.disciplineRepository.findOneBy({ id: item.disciplineId });
          if (!discipline) throw new BadRequestException(`Discipline ${item.disciplineId} not found`);

          const cdEntity = new CurriculumDisciplineEntity();
          cdEntity.curriculumId = savedCurriculum.id;
          cdEntity.disciplineId = item.disciplineId;
          cdEntity.semester = item.semester;
          cdEntity.lectureHours = item.lectureHours;
          cdEntity.practiceHours = item.practiceHours;
          cdEntity.labHours = item.labHours;
          cdEntity.selfStudyHours = item.selfStudyHours;
          cdEntity.controlHours = item.controlHours;
          cdEntity.attestation = item.attestation as AttestationType;
          cdEntity.hasCourseWork = item.hasCourseWork ?? false;
          cdEntity.hasCourseProject = item.hasCourseProject ?? false;
          cdEntity.courseWorkSemester = item.courseWorkSemester;

          return cdEntity;
        }),
      );

      await queryRunner.manager.save(cdEntities);
      await queryRunner.commitTransaction();

      return this.findOne(savedCurriculum.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryCurriculumDto): Promise<CurriculumEntity[]> {
    const qb = this.curriculumRepository
      .createQueryBuilder('curriculum')
      .leftJoinAndSelect('curriculum.specialty', 'specialty')
      .leftJoinAndSelect('curriculum.academicYear', 'academicYear')
      .where('curriculum.isActive = true');

    if (query.specialtyId) qb.andWhere('curriculum.specialtyId = :specialtyId', { specialtyId: query.specialtyId });
    if (query.yearOfAdmission) qb.andWhere('curriculum.yearOfAdmission = :year', { year: query.yearOfAdmission });
    if (query.search) {
      qb.andWhere('curriculum.name ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('curriculum.yearOfAdmission', 'DESC').addOrderBy('specialty.name', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<CurriculumEntity> {
    const curriculum = await this.curriculumRepository.findOne({
      where: { id },
      relations: {
        specialty: true,
        academicYear: true,
        disciplines: { discipline: true },
      },
    });
    if (!curriculum) throw new NotFoundException(`Curriculum with id ${id} not found`);
    return curriculum;
  }

  async update(id: number, dto: UpdateCurriculumDto): Promise<CurriculumEntity> {
    const curriculum = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Обновляем основные поля
      if (dto.name) curriculum.name = dto.name;
      if (dto.specialtyId) {
        const specialty = await this.specialtyRepository.findOneBy({ id: dto.specialtyId });
        if (!specialty) throw new BadRequestException('Specialty not found');
        curriculum.specialtyId = dto.specialtyId;
      }
      if (dto.academicYearId) {
        const year = await this.yearRepository.findOneBy({ id: dto.academicYearId });
        if (!year) throw new BadRequestException('Academic year not found');
        curriculum.academicYearId = dto.academicYearId;
      }
      if (dto.yearOfAdmission !== undefined) curriculum.yearOfAdmission = dto.yearOfAdmission;
      if (dto.isActive !== undefined) curriculum.isActive = dto.isActive;

      await queryRunner.manager.save(curriculum);

      // Если передан массив дисциплин, обновляем их
      if (dto.disciplines) {
        // Удаляем старые дисциплины
        await queryRunner.manager.delete(CurriculumDisciplineEntity, { curriculumId: id });

        // Создаём новые
        const cdEntities = await Promise.all(
          dto.disciplines.map(async (item) => {
            const discipline = await this.disciplineRepository.findOneBy({ id: item.disciplineId });
            if (!discipline) throw new BadRequestException(`Discipline ${item.disciplineId} not found`);

            const cdEntity = new CurriculumDisciplineEntity();
            cdEntity.disciplineId = item.disciplineId;
            cdEntity.semester = item.semester;
            cdEntity.lectureHours = item.lectureHours;
            cdEntity.practiceHours = item.practiceHours;
            cdEntity.labHours = item.labHours;
            cdEntity.selfStudyHours = item.selfStudyHours;
            cdEntity.controlHours = item.controlHours;
            cdEntity.attestation = item.attestation as AttestationType;
            cdEntity.hasCourseWork = item.hasCourseWork ?? false;
            cdEntity.hasCourseProject = item.hasCourseProject ?? false;
            cdEntity.courseWorkSemester = item.courseWorkSemester;

            return cdEntity;
          }),
        );
        await queryRunner.manager.save(cdEntities);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const curriculum = await this.findOne(id);
    curriculum.isActive = false;
    await this.curriculumRepository.save(curriculum);
  }

  async copy(id: number, newYearOfAdmission: number): Promise<CurriculumEntity> {
    const source = await this.findOne(id);

    const newCurriculum = this.curriculumRepository.create({
      name: `${source.name} (копия ${newYearOfAdmission})`,
      specialtyId: source.specialtyId,
      academicYearId: null, // нужно будет выбрать актуальный учебный год отдельно
      yearOfAdmission: newYearOfAdmission,
      isActive: true,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saved = await queryRunner.manager.save(newCurriculum);

      // Копируем дисциплины
      const cdEntities = source.disciplines.map((cd) =>
        this.cdRepository.create({
          curriculumId: saved.id,
          disciplineId: cd.disciplineId,
          semester: cd.semester,
          lectureHours: cd.lectureHours,
          practiceHours: cd.practiceHours,
          labHours: cd.labHours,
          selfStudyHours: cd.selfStudyHours,
          controlHours: cd.controlHours,
          attestation: cd.attestation,
          hasCourseWork: cd.hasCourseWork,
          hasCourseProject: cd.hasCourseProject,
          courseWorkSemester: cd.courseWorkSemester,
        }),
      );
      await queryRunner.manager.save(cdEntities);

      await queryRunner.commitTransaction();
      return this.findOne(saved.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}