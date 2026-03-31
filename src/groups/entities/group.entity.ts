import { UserEntity } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('groups')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    label: string

    @ManyToOne(() => UserEntity, (user) => user.id)
    curator: UserEntity

}
