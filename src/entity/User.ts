import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from "typeorm";
import { UserRoom } from "./UserRoom";
import { RoomMessages } from "./Messages";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => UserRoom, userRoom => userRoom.user)
    usersInRoom: UserRoom[]

    @OneToMany(() => RoomMessages, msg => msg.user)
    msgs: RoomMessages[]

    @Index({ unique: true })
    @Column({ type: "varchar", length: 60 })
    username: string;

    @Column("text")
    firstName: string;

    @Column("text")
    lastName: string;

    @Column("text")
    userImage: string
}
