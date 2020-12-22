import { getConnection, getRepository } from "typeorm";
import { data } from "../data/dummy";
import { User } from "../entity/User";
import { ChatCategory } from "../entity/ChatCategory";
import { ChatRoom } from "../entity/ChatRoom";
import { UserRoom } from "../entity/UserRoom";
import { RoomMessages } from "../entity/Messages";
import { DateExtended } from "../utils";

export class DataFillerController {
    private connection = getConnection();
    private roomsCountInCat = 20;
    private initUsersInRoom = 5;
    private maxMsg = 15;

    private generateDummyMessage(length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -_?!';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async createTables() {
        await this.connection.synchronize();
        let usersArr = [];
        let usersCount = await getRepository(User).count();
        console.log(`users count ${usersCount}`);
        if (data.firstnames.length * data.lastnames.length > usersCount) {
            if (usersCount > 0) await this.connection.manager.clear(User);
            data.firstnames.forEach(async firstN => {
                data.lastnames.forEach(async lastN => {
                    usersArr.push(await this.connection.manager.save(this.connection.manager.create(User, {
                        username: firstN + lastN,
                        firstName: firstN,
                        lastName: lastN,
                        userImage: `image-url-of-${firstN}-${lastN}`
                    })));
                })
            })
        }

        let catCount = await getRepository(ChatCategory).count();
        let roomsCount = await getRepository(ChatRoom).count();
        console.log(`categories count ${catCount}`);
        console.log(`rooms count ${roomsCount}`);
        if (data.categories.length > catCount || this.roomsCountInCat * data.categories.length > roomsCount) {
            if (roomsCount > 0) await this.connection.manager.clear(ChatRoom);
            if (catCount > 0) await this.connection.manager.clear(ChatCategory);
            data.categories.forEach(async cat => {
                let catRes = await this.connection.manager.save(this.connection.manager.create(ChatCategory, cat));
                for (let i = 1; i <= this.roomsCountInCat; i++) {
                    let room = this.connection.manager.create(ChatRoom, {
                        roomName: `${cat.catName}_room${i}`,
                        roomImage: `image-url-of-${cat.catName}_room${i}`,
                        roomDesc: `This is the description of room ${cat.catName}_room${i}`,
                        category: catRes
                    })
                    let roomRes = await this.connection.manager.save(room);
                    let usersGroup = new Set();
                    while (usersGroup.size < (Math.floor(Math.random() * this.initUsersInRoom) + 4)) {
                        usersGroup.add(usersArr[Math.floor(Math.random() * usersArr.length)]);
                    }
                    for (let user of usersGroup) {
                        for (let i = 0; i < Math.floor(Math.random() * this.maxMsg); i++) {
                            let msg = this.connection.manager.create(RoomMessages, {
                                user,
                                room: roomRes
                            })
                            if (Math.random() < 0.7) {
                                msg.messageText = this.generateDummyMessage(30);
                                if (Math.random() < 0.5) {
                                    msg.messageImage = 'image-url-${this.generateDummyMessage(6)}'
                                }
                                else {
                                    msg.messageImage = '';
                                }
                            }
                            else {
                                msg.messageImage = 'image-url-${this.generateDummyMessage(6)}'
                                msg.messageText = '';
                            }
                            msg.createdAt = (new DateExtended(Date.now() - 60000 * (Math.floor(Math.random() * 180))).getMysqlFormat())
                            await this.connection.manager.save(msg)
                        }
                        await this.connection.manager.save(this.connection.manager.create(UserRoom, {
                            user,
                            room: roomRes,
                            lastVisit: (new DateExtended(Date.now() - 60000 * (Math.floor(Math.random() * 60))).getMysqlFormat())
                        }))
                    }
                }
            });
        }

        console.log(`createTables functions finished its job!`)
    }
}
