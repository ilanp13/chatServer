import { getRepository, SelectQueryBuilder } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { ChatCategory } from "../entity/ChatCategory";
import { ChatRoom } from "../entity/ChatRoom";
import { UserRoom } from "../entity/UserRoom";

export class CategoryController {

    private categoryRepository = getRepository(ChatCategory);

    async all(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        return this.categoryRepository
            .createQueryBuilder("cat")
            .select("cat.catName")
            .innerJoin(
                query => this.roomsUsersInnerJoins(query, userId).limit(5),
                'rooms',
                'cat.id = rooms.chatCat'
            )
            .orderBy('cat.catName', 'ASC')
            .getRawMany()
    }

    async roomsInCategory(request: Request, response: Response, next: NextFunction) {
        const userId = request.session.userId;
        return this.categoryRepository
            .createQueryBuilder("cat")
            .select("cat.catName")
            .where('cat.id = :catId', { catId: request.params.catId })
            .innerJoin(
                query => this.roomsUsersInnerJoins(query, userId),
                'rooms',
                'cat.id = rooms.chatCat'
            )
            .getRawOne()
    }

    private roomsUsersInnerJoins(query: SelectQueryBuilder<any>, userId: number) {
        return query
            .from(ChatRoom, 'rooms')
            .select('*')
            .innerJoin(
                query => {
                    return query
                        .from(UserRoom, 'userRoom1')
                        .select('COUNT(userRoom1.userId)', 'membersCount')
                },
                'userRoom1',
                'rooms.id = userRoom1.roomId'
            )
            .innerJoin(
                query => {
                    return query
                        .from(UserRoom, 'userRoom2')
                        .select('COUNT(userRoom2.userId)', 'userInRoom')
                        .where('userRoom2.userId = :userId', { userId })
                },
                'userRoom2',
                'rooms.id = userRoom2.roomId'
            )
            .orderBy('membersCount', 'DESC')
    }
}
