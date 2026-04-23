import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CurriculumEntity } from './curriculum.entity';

@Entity('academic_years')
export class AcademicYearEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 9, unique: true })
  name: string; // например "2025/2026"

  @Column({ type: 'smallint' })
  startYear: number; // 2025

  @Column({ type: 'smallint' })
  endYear: number; // 2026

  @OneToMany(() => CurriculumEntity, (curriculum) => curriculum.academicYear)
  curriculums: CurriculumEntity[];
}