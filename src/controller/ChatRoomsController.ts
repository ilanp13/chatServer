import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { ChatRoom } from "../entity/ChatRoom";
import { UserRoom } from "../entity/UserRoom";
import { RoomMessages } from "../entity/Messages";

export class ChatRoomController {

    private chatRoomRepository = getRepository(ChatRoom);
    private userRoomRepository = getRepository(UserRoom);

    async getUserChatRooms(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        return this.chatRoomRepository
            .createQueryBuilder('room')
            .select('*')
            .innerJoin(
                query => {
                    return query
                        .from(UserRoom, 'userRoom1')
                        .select('COUNT(userRoom1.userId)', 'membersCount')
                },
                'userRoom1',
                'room.id = userRoom1.roomId'
            )
            .innerJoin(
                query => {
                    return query
                        .from(UserRoom, 'userRoom2')
                        .select('userRoom2.lastVisit, COUNT(userRoom2.userId)', 'userInRoom')
                        .where('userRoom2.userId = :userId', { userId })
                },
                'userRoom2',
                'room.id = userRoom2.roomId'
            )
            .innerJoin(
                query => {
                    return query
                        .from(RoomMessages, 'msgs1')
                        .select('COUNT(msgs1.id)', 'unreadCount')
                        .where('msgs1.createdAt > userRoom2.lastVisit')
                },
                'msgs1',
                'room.id = msgs1.roomId'
            )
            .innerJoin(
                query => {
                    return query
                        .from(RoomMessages, 'msgs2')
                        .select('msgs2.createdAt', 'lastMsgTime')
                },
                'msgs2',
                'room.id = msgs2.roomId'
            )
            .where('userInRoom > 0')
            .orderBy('msgs2.lastMsgTime', 'DESC')
            .getRawMany()

    }

    async updateUserLastVisit(request: Request, response: Response, next: NextFunction) {
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
        userRoom.lastVisit = new Date();
        return this.userRoomRepository.save(userRoom);
    }

    async addUserToRoom(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            roomId,
            userId
        });
        if (userRoom.id) {
            return { status: 400, Message: `UserId ${userId} is already part of room id ${userRoom.roomId} ` }
        }
        let newUserRoom = new UserRoom();
        newUserRoom.userId = userId;
        newUserRoom.roomId = roomId;
        newUserRoom.lastVisit = new Date();
        return this.userRoomRepository.save(newUserRoom);
    }

    async removeUserFromRoom(request: Request, response: Response, next: NextFunction) {
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
        return this.userRoomRepository.remove(userRoom);
    }


}
