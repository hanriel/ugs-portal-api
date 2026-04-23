import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SpecialtyEntity } from '../../specialties/entities/specialty.entity'; // ваша существующая сущность
import { AcademicYearEntity } from './academic-year.entity';
import { CurriculumDisciplineEntity } from './curriculum-discipline.entity';

@Entity('curriculums')
export class CurriculumEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string; // "Учебный план 09.02.07 (2025)"

  @ManyToOne(() => SpecialtyEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'specialty_id' })
  specialty: SpecialtyEntity;

  @Column({ name: 'specialty_id' })
  specialtyId: number;

  @ManyToOne(() => AcademicYearEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYearEntity;

  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @Column({ type: 'smallint' })
  yearOfAdmission: number; // год начала обучения (набора), например 2025

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => CurriculumDisciplineEntity, (cd) => cd.curriculum, { cascade: true })
  disciplines: CurriculumDisciplineEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}