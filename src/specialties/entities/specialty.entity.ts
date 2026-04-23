import { BranchEntity } from "src/branches/entities/branches.entity";
import { GroupEntity } from "src/groups/entities/group.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('specialty')
export class SpecialtyEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => BranchEntity, (branch) => branch.specialties)
    @JoinColumn({ name: 'branch_id' })
    branch: BranchEntity;

    @Column({ name: 'branch_id' })
    branchId: number;

    @OneToMany(() => GroupEntity, (group) => group.specialty)
    groups: GroupEntity[];
}
