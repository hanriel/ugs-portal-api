import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CurriculumDisciplineEntity } from './curriculum-discipline.entity';

@Entity('disciplines')
export class DisciplineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string; // "Математический анализ"

  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string; // "Б1.О.01"

  @OneToMany(() => CurriculumDisciplineEntity, (cd) => cd.discipline)
  curriculumDisciplines: CurriculumDisciplineEntity[];
}