import { GroupEntity } from "src/groups/entities/group.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('schedule')
export class ScheduleEnity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(group => GroupEntity)
    @JoinColumn({ name: "group_id" })
    group_id: GroupEntity

    @Column("text")
    pairs: string

    @Column()
    date: Date

    @Column()
    startAt: string
}
