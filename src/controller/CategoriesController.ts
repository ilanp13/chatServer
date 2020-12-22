import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { ChatCategory } from "../entity/ChatCategory";
import { ChatRoom } from "../entity/ChatRoom";
import { UserRoom } from "../entity/UserRoom";

export class CategoryController {

    private categoryRepository = getRepository(ChatCategory);
    private chatRoomsRepository = getRepository(ChatRoom);

    async all(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const catList = await this
            .categoryRepository
            .createQueryBuilder("cat")
            .getRawMany();

        for (let i = 0; i < catList.length; i++) {
            let query = this.chatRoomsRepository.createQueryBuilder('room')
                .select('room.*, userRoom1.membersCount, userRoom2.userInRoom')
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
                .where('room.categoryId = :catId', { catId: catList[i].cat_id })
                .orderBy('membersCount', 'DESC')
                .limit(5);
            catList[i]['rooms'] = await query.getRawMany();
        };
        return catList;
    }

    async roomsInCategory(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        const catData = await this
            .categoryRepository
            .createQueryBuilder("cat")
            .where('cat.id = :catId', { catId: request.params.catId })
            .getRawOne();

        catData['rooms'] = await this.chatRoomsRepository.createQueryBuilder('room')
            .select('room.*, userRoom1.membersCount, userRoom2.userInRoom')
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
            .where('room.categoryId = :catId', { catId: catData.cat_id })
            .orderBy('membersCount', 'DESC')
            .getRawMany()

        return catData;
    }
}
