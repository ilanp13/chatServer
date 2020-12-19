import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ChatCategory } from "./ChatCategory";
import { UserRoom } from "./UserRoom";
import { RoomMessages } from "./Messages";

@Entity()
export class ChatRoom {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ChatCategory, chatCat => chatCat.rooms)
    chatCat: ChatCategory;

    @OneToMany(() => UserRoom, userRoom => userRoom.chatRoom)
    usersInRoom: UserRoom[]

    @OneToMany(() => RoomMessages, msg => msg.msgRoom)
    msgs: RoomMessages[]

    @Column("text")
    roomName: string;

    @Column("text")
    roomImage: string;

    @Column("text")
    roomDesc: string;
}
