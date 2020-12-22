import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";

@Entity()
@Index(["room", "createdAt"])
export class RoomMessages {

    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    createdAt: string;

    @Column("text")
    messageText: string;

    @Column("text")
    messageImage: string;

    @ManyToOne(() => User, user => user.msgs)
    user: User

    @ManyToOne(() => ChatRoom, room => room.msgs)
    room: ChatRoom
}
