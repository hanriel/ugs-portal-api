import { RoleEntity } from "src/roles/entities/role.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    first_name: string    

    @Column()
    last_name: string

    @Column({ nullable: true })
    middle_name: string

    @ManyToOne(() => RoleEntity, (role) => role.roles)
    role: RoleEntity

    @Column()
    ldapId: string

    @Column({ nullable: true })
    email: string

    @Column({ type: 'timestamp', nullable: true })
    birth_date: Date

    @Column({ nullable: true })
    sex: boolean
    
    @Column({ nullable: true })
    telephone: string

    @Column({ nullable: true })
    address: string
}
