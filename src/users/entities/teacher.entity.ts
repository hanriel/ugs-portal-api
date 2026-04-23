import { ChildEntity, Column, OneToMany } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';
import { GroupEntity } from 'src/groups/entities/group.entity';

@ChildEntity(UserRole.TEACHER)
export class TeacherEntity extends UserEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  degree: string;

  // Группы, в которых преподаватель является куратором
  @OneToMany(() => GroupEntity, (group) => group.curator)
  curatedGroups: GroupEntity[];
}