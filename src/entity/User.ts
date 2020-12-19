import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from "typeorm";
import { UserRoom } from "./UserRoom";
import { RoomMessages } from "./Messages";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => UserRoom, userRoom => userRoom.chatUser)
    usersInRoom: UserRoom[]

    @OneToMany(() => RoomMessages, msg => msg.msgUser)
    msgs: RoomMessages[]

    @Index({ unique: true })
    @Column("text")
    username: string;

    @Column("text")
    firstName: string;

    @Column("text")
    lastName: string;

    @Column("string")
    userImage: string
}
