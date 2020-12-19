import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";

export class UserController {

    private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.userId);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.userId);
        return this.userRepository.remove(userToRemove);
    }

    async login(request: Request, response: Response, next: NextFunction) {
        let sess = request.session
        if (sess.userId) return { status: 400, error: `User ${sess.username} is already logged in!` }
        let loginUser = await this.userRepository.findOne({ username: request.params.username })
        if (typeof loginUser == "undefined") {
            return { status: 400, error: `No user exist with username ${request.params.username}` }
        }
        sess.username = loginUser.username;
        sess.userId = loginUser.id;
        return { status: 200, message: `user ${request.params.username} logged in successfully` }
    }

    async logout(request: Request, response: Response, next: NextFunction) {
        return new Promise((resolve, reject) => {
            request.session.destroy(err => {
                if (err) {
                    console.log(err);
                    reject({ status: 400, message: err });
                }
                resolve({ status: 200, message: `You're logged out! Goodbye!` })
            })
        })
    }

}
