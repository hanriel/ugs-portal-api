import { UserEntity } from "src/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string  

    @OneToMany(() => UserEntity, (user) => user.role)
    roles: UserEntity[]
}
