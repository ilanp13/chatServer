import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";

@Entity()
@Index(["user", "room"], { unique: true })
export class UserRoom {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("timestamp", {
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP"
    })
    lastVisit: string;

    @ManyToOne(() => User, user => user.usersInRoom)
    user: User

    @ManyToOne(() => ChatRoom, room => room.usersInRoom)
    room: ChatRoom
}
