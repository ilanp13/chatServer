import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { ChatRoom } from "../entity/ChatRoom";
import { UserRoom } from "../entity/UserRoom";
import { RoomMessages } from "../entity/Messages";
import { User } from "../entity/User";
import { DateExtended } from "../utils";

export class ChatRoomController {

    private chatRoomRepository = getRepository(ChatRoom);
    private userRoomRepository = getRepository(UserRoom);
    private userRepository = getRepository(User);

    async getUserChatRooms(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        let q = this.chatRoomRepository
            .createQueryBuilder('room')
            .select('room.*, userRoom1.membersCount, userRoom2.userInRoom, userRoom3.unreadCount, msgs2.lastMsgTime')
            .leftJoin(
                query => {
                    return query
                        .from(UserRoom, 'ur1')
                        .select('ur1.room AS ur1_roomId, COUNT(ur1.user)', 'membersCount')
                        .groupBy('ur1.room')
                },
                'userRoom1',
                'room.id = ur1_roomId'
            )
            .leftJoin(
                query => {
                    return query
                        .from(UserRoom, 'ur2')
                        .select('ur2.room AS ur2_roomId, COUNT(ur2.user)', 'userInRoom')
                        .where('ur2.user = :userId', { userId })
                        .groupBy('ur2.room')
                },
                'userRoom2',
                'room.id = ur2_roomId'
            )
            .leftJoin(
                query => {
                    return query
                        .from(UserRoom, 'ur3')
                        .select('ur3.room AS ur3_roomId, ur3.lastVisit AS lastVisitInRoom, COUNT(ms1_createdAt)', 'unreadCount')
                        .leftJoin(
                            query => {
                                return query
                                    .from(RoomMessages, 'ms1')
                                    .select('ms1.room as ms1_roomId, ms1.createdAt', 'ms1_createdAt')
                            },
                            'msgs1',
                            'ur3.room = ms1_roomId'
                        )
                        .where('ur3.user = :userId', { userId })
                        .andWhere('ms1_createdAt > ur3.lastVisit')
                        .groupBy('ur3_roomId, lastVisitInRoom')
                },
                'userRoom3',
                'room.id = ur3_roomId'
            )
            .leftJoin(
                query => {
                    return query
                        .from(RoomMessages, 'ms2')
                        .select('ms2.room as ms2_roomId, MAX(ms2.createdAt)', 'lastMsgTime')
                        .groupBy('ms2.room')
                },
                'msgs2',
                'room.id = ms2_roomId'
            )
            .where('userRoom2.userInRoom > 0')
            .orderBy('msgs2.lastMsgTime', 'DESC')
        return q.getRawMany()

    }

    async updateUserLastVisit(request: Request, response: Response, next: NextFunction) {
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
        userRoom.lastVisit = (new DateExtended().getMysqlFormat())
        return this.userRoomRepository.save(userRoom);
    }

    async addUserToRoom(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const roomId = parseInt(request.params.roomId);
        const userRoom = await this.userRoomRepository.findOne({
            where: {
                room: roomId,
                user: userId
            }
        });
        if (userRoom && userRoom.id) {
            return { status: 400, Message: `UserId ${userId} is already part of room id ${roomId} ` }
        }
        let newUserRoom = new UserRoom();
        newUserRoom.user = await this.userRepository.findOne(userId);
        newUserRoom.room = await this.chatRoomRepository.findOne(roomId);
        newUserRoom.lastVisit = (new DateExtended().getMysqlFormat())
        return this.userRoomRepository.save(newUserRoom);
    }

    async removeUserFromRoom(request: Request, response: Response, next: NextFunction) {
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
        return this.userRoomRepository.remove(userRoom);
    }


}
