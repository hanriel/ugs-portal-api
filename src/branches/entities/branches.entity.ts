import { SpecialtyEntity } from "src/specialties/entities/specialty.entity";
import { UserEntity } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('branch')
export class BranchEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'supervisor_id' })
    supervisor: UserEntity;

    @OneToMany(() => SpecialtyEntity, (specialty) => specialty.branch)
    specialties: SpecialtyEntity[];
}
