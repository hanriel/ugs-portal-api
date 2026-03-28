import { BranchEntity } from "src/branches/entities/branches.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('specialty')
export class SpecialtyEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => BranchEntity, (branch) => branch.id)
    brach: BranchEntity
}
