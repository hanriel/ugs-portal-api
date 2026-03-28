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

    @Column()
    middle_name: string

    @ManyToOne(() => RoleEntity, (role) => role.roles)
    role: RoleEntity

    @Column()
    login: string

    @Column()
    password: string

    @Column()
    email: string

    @Column({ type: 'timestamp'})
    birth_date: Date

    @Column()
    sex: boolean
    
    @Column()
    telephone: string

    @Column()
    address: string
  sAMAccountName: any;
  dn: any;
}
