import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";


@Entity()
@Index(["roomId", "createdAt"])
export class RoomMessages {

    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @CreateDateColumn({ type: "timestamp", default: () => new Date() })
    createdAt: Date;

    @Column("text")
    messageText: string;

    @Column("text")
    messageImage: string;

    @Column()
    userId: number;

    @Column()
    roomId: number;

    @ManyToOne(() => User, user => user.msgs)
    msgUser: User

    @ManyToOne(() => ChatRoom, room => room.msgs)
    msgRoom: ChatRoom
}
