import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CurriculumEntity } from './curriculum.entity';
import { DisciplineEntity } from './discipline.entity';

export enum AttestationType {
  EXAM = 'exam',
  CREDIT = 'credit',
  DIFFERENTIATED_CREDIT = 'diff_credit',
  COURSE_WORK = 'course_work',
  COURSE_PROJECT = 'course_project',
}

@Entity('curriculum_disciplines')
export class CurriculumDisciplineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Внешний ключ на учебный план
  @Column({ name: 'curriculum_id' })
  curriculumId: number;

  @ManyToOne(() => CurriculumEntity, (c) => c.disciplines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curriculum_id' })
  curriculum: CurriculumEntity;

  // Внешний ключ на дисциплину
  @Column({ name: 'discipline_id' })
  disciplineId: number;

  @ManyToOne(() => DisciplineEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'discipline_id' })
  discipline: DisciplineEntity;

  @Column({ type: 'smallint' })
  semester: number;

  @Column({ type: 'smallint', default: 0 })
  lectureHours: number;

  @Column({ type: 'smallint', default: 0 })
  practiceHours: number;

  @Column({ type: 'smallint', default: 0 })
  labHours: number;

  @Column({ type: 'smallint', default: 0 })
  selfStudyHours: number;

  @Column({ type: 'smallint', default: 0 })
  controlHours: number;

  @Column({ type: 'enum', enum: AttestationType, nullable: true })
  attestation: AttestationType;

  @Column({ type: 'boolean', default: false })
  hasCourseWork: boolean;

  @Column({ type: 'boolean', default: false })
  hasCourseProject: boolean;

  @Column({ type: 'smallint', nullable: true })
  courseWorkSemester: number;
}