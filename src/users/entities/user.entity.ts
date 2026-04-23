import { GroupEntity } from "src/groups/entities/group.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
@Index("IDX_USER_ROLE_ACTIVE",['role', 'isActive'])
@TableInheritance({ column: { type: 'enum', name: 'role', enum: UserRole } })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    // ---- Данные из LDAP (синхронизируются) ----
    @Column({ type: 'text', unique: true })
    dn: string; // distinguishedName
 
    @Column({ type: 'varchar', length: 50, unique: true })
    @Index("IDX_USER_USERNAME")
    username: string; // sAMAccountName
    
    @Column()
    first_name: string    

    @Column()
    last_name: string

    @Column({ nullable: true })
    middle_name: string

    @Column({ nullable: true })
    email: string

    @Column({ type: 'blob', unique: true, nullable: true })
    @Index("IDX_USER_LDAP_GUID", { unique: true })
    ldapGuid: Buffer; // objectGUID из Active Directory

    // ---- Общие служебные поля ----
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Роль определяется автоматически через дискриминатор
    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;
}
