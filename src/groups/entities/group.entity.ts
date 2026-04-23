import { CurriculumEntity } from "src/curriculums/entities/curriculum.entity";
import { SpecialtyEntity } from "src/specialties/entities/specialty.entity";
import { StudentEntity } from "src/users/entities/student.entity";
import { TeacherEntity } from "src/users/entities/teacher.entity";
import { UserEntity } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('groups')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id: number

    // LDAP distinguished name (DN) – уникальный идентификатор в рамках домена
    @Column({ type: 'varchar', length: 255, unique: true })
    dn: string;

    @Column()
    label: string

    // LDAP objectGUID в бинарном виде (16 байт)
    @Column({ type: 'blob', unique: true, nullable: true })
    ldapGuid: Buffer;

    // Связь с куратором (преподавателем)
    @ManyToOne(() => TeacherEntity, (teacher) => teacher.curatedGroups, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'curator_id' })
    curator: TeacherEntity;

    // Внешний ключ для удобства
    @Column({ name: 'curator_id', nullable: true })
    curatorId: number;

    // Связь со специальностью
    @ManyToOne(() => SpecialtyEntity, (specialty) => specialty.groups, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'specialty_id' })
    specialty: SpecialtyEntity;

    // Внешний ключ для удобства
    @Column({ name: 'specialty_id', nullable: true })
    specialtyId: number;

    @OneToMany(() => StudentEntity, (student) => student.group)
    students: StudentEntity[];

    @ManyToOne(() => CurriculumEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'curriculum_id' })
    curriculum: CurriculumEntity;

    @Column({ name: 'curriculum_id', nullable: true })
    curriculumId: number;

    // Признак активности
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
