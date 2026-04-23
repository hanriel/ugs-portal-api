import { Entity, Column, ManyToOne, JoinColumn, ChildEntity } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';
import { GroupEntity } from '../../groups/entities/group.entity';

@ChildEntity(UserRole.STUDENT)
export class StudentEntity extends UserEntity {
  // Специфичные поля только для студентов
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  // Связь с группой (обязательна для студента)
  @ManyToOne(() => GroupEntity, (group) => group.students, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @Column({ name: 'group_id' })
  groupId: number;
}