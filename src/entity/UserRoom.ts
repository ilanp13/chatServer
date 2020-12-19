import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";


@Entity()
@Index(["userId", "roomId"], { unique: true })
export class UserRoom {

    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    userId: number;

    @Index()
    @Column()
    roomId: number;

    @Column({ type: "timestamp", default: () => new Date() })
    lastVisit: Date;

    @ManyToOne(() => User, user => user.usersInRoom)
    chatUser: User

    @ManyToOne(() => ChatRoom, room => room.usersInRoom)
    chatRoom: ChatRoom
}
