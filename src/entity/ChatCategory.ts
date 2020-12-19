import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ChatRoom } from "./ChatRoom";

@Entity()
export class ChatCategory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    catName: string;

    @OneToMany(() => ChatRoom, room => room.chatCat)
    rooms: ChatRoom[]
}
