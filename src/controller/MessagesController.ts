import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { RoomMessages } from "../entity/Messages";
import { UserRoom } from "../entity/UserRoom";
import { User } from "../entity/User";

export class MessagesController {

    private messagesRepository = getRepository(RoomMessages);
    private userRoomRepository = getRepository(UserRoom);

    async getMessagesFromLast(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            roomId,
            userId
        });
        if (!userRoom.id) {
            return {
                status: 400, Message: `The userId ${userId} is not a member of the roomId ${roomId}!`
            }
        }
        const offset = parseInt(request.params.offset || '0');
        return this.messagesRepository
            .createQueryBuilder("msg")
            .select("*")
            .where('msg.roomId = :roomId', { roomId })
            .innerJoin(
                query => {
                    return query
                        .from(User, 'userData')
                        .select("*")
                        .cache(true)
                },
                'userData',
                'msg.userId = userData.id'
            )
            .limit(50)
            .offset(offset)
            .orderBy('msg.createdAt', 'DESC')
            .getRawMany()
    }

    async getMessagesLastViewed(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            roomId,
            userId
        });
        if (!userRoom.id) {
            return {
                status: 400, Message: `The userId ${userId} is not a member of the roomId ${roomId}!`
            }
        }
        const offset = parseInt(request.params.offset || '0');
        let readOffset = offset < 0 ? Math.abs(offset) : 0;
        let unreadOffset = offset > 0 ? offset : 0;
        let readResults, unreadResults;
        if (offset <= 0) {
            readResults = await this.messagesRepository
                .createQueryBuilder("msg")
                .select("*")
                .where('msg.roomId = :roomId AND msg.createdAt <= :lastVisit', {
                    roomId,
                    lastVisit: userRoom.lastVisit
                })
                .innerJoin(
                    query => {
                        return query
                            .from(User, 'userData')
                            .select("*")
                            .cache(true)
                    },
                    'userData',
                    'msg.userId = userData.id'
                )
                .limit(20)
                .offset(readOffset)
                .orderBy('msg.createdAt', 'DESC')
                .getRawMany()
        }
        if (offset >= 0) {
            unreadResults = await this.messagesRepository
                .createQueryBuilder("msg")
                .select("*")
                .where('msg.roomId = :roomId AND msg.createdAt > :lastVisit', {
                    roomId,
                    lastVisit: userRoom.lastVisit
                })
                .innerJoin(
                    query => {
                        return query
                            .from(User, 'userData')
                            .select("*")
                            .cache(true)
                    },
                    'userData',
                    'msg.userId = userData.id'
                )
                .limit(20)
                .offset(unreadOffset)
                .orderBy('msg.createdAt', 'ASC')
                .getRawMany()
        }
        return {
            readMessages: readResults,
            unreadMessages: unreadResults.reverse()
        }
    }

    async sendNewMessage(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            roomId,
            userId
        });
        if (!userRoom.id) {
            return {
                status: 400, Message: `The userId ${userId} is not a member of the roomId ${roomId}!`
            }
        }
        const msgData = request.body;
        const newMsg = new RoomMessages()
        newMsg.userId = userId;
        newMsg.roomId = roomId;
        newMsg.messageText = msgData.messageText;
        newMsg.messageImage = msgData.messageImage;
        newMsg.createdAt = new Date();
        return this.messagesRepository.save(newMsg);
    }

}
