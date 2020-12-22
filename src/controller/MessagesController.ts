import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { RoomMessages } from "../entity/Messages";
import { UserRoom } from "../entity/UserRoom";
import { User } from "../entity/User";
import { ChatRoom } from "../entity/ChatRoom";
import { DateExtended } from "../utils";

export class MessagesController {

    private messagesRepository = getRepository(RoomMessages);
    private userRoomRepository = getRepository(UserRoom);
    private userRepository = getRepository(User);
    private chatRoomRepository = getRepository(ChatRoom);

    async getMessagesFromLast(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            where: {
                room: roomId,
                user: userId
            }
        });
        if (!userRoom || !userRoom.id) {
            return {
                status: 400, Message: `The userId ${userId} is not a member of the roomId ${roomId}!`
            }
        }
        const offset = parseInt(request.params.offset || '0');
        return this.messagesRepository
            .createQueryBuilder("msg")
            .select('msg.*, userData.userName, userData.firstName, userData.lastName, userData.userImage')
            .leftJoin('msg.user', 'userData')
            .where('msg.room = :roomId', { roomId })
            .limit(50)
            .offset(offset)
            .orderBy('msg.createdAt', 'DESC')
            .getRawMany()
    }

    async getMessagesLastViewed(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            where: {
                room: roomId,
                user: userId
            }
        });
        if (!userRoom || !userRoom.id) {
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
                .select('msg.*, userData.userName, userData.firstName, userData.lastName, userData.userImage')
                .where('msg.room = :roomId', { roomId })
                .andWhere('msg.createdAt <= :lastVisit', {
                    lastVisit: userRoom.lastVisit
                })
                .leftJoin('msg.user', 'userData')
                .limit(3)
                .offset(readOffset)
                .orderBy('msg.createdAt', 'DESC')
                .getRawMany()
        }
        if (offset >= 0) {
            unreadResults = await this.messagesRepository
                .createQueryBuilder("msg")
                .select('msg.*, userData.userName, userData.firstName, userData.lastName, userData.userImage')
                .where('msg.room = :roomId', { roomId })
                .andWhere('msg.createdAt > :lastVisit', {
                    lastVisit: userRoom.lastVisit
                })
                .leftJoin('msg.user', 'userData')
                .limit(3)
                .offset(unreadOffset)
                .orderBy('msg.createdAt', 'ASC')
                .getRawMany()
        }
        let retObj = {
            readMessages: null,
            unreadMessages: null
        };
        if (readResults) {
            retObj.readMessages = readResults;
        }
        if (unreadResults) {
            retObj.unreadMessages = unreadResults.reverse();
        }
        return retObj;
    }

    async sendNewMessage(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            where: {
                room: roomId,
                user: userId
            }
        });
        if (!userRoom.id) {
            return {
                status: 400, Message: `The userId ${userId} is not a member of the roomId ${roomId}!`
            }
        }
        const msgData = request.body;
        const newMsg = new RoomMessages()
        newMsg.user = await this.userRepository.findOne(userId);
        newMsg.room = await this.chatRoomRepository.findOne(roomId);
        newMsg.messageText = msgData.messageText || '';
        newMsg.messageImage = msgData.messageImage || '';
        newMsg.createdAt = (new DateExtended().getMysqlFormat())
        return this.messagesRepository.save(newMsg);
    }

}
