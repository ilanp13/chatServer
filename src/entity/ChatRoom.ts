import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ChatCategory } from "./ChatCategory";
import { UserRoom } from "./UserRoom";
import { RoomMessages } from "./Messages";

@Entity()
export class ChatRoom {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ChatCategory, chatCat => chatCat.rooms)
    category: ChatCategory;

    @OneToMany(() => UserRoom, userRoom => userRoom.room)
    usersInRoom: UserRoom[]

    @OneToMany(() => RoomMessages, msg => msg.room)
    msgs: RoomMessages[]

    @Column("text")
    roomName: string;

    @Column("text")
    roomImage: string;

    @Column("text")
    roomDesc: string;
}
