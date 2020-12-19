import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { ChatSession } from "./entity/Session"
import { TypeormStore } from "connect-typeorm/out";

createConnection().then(async connection => {
    // create express app
    const app = express();
    app.use(session({
        secret: 'dummy_secret',
        store: new TypeormStore({
            cleanupLimit: 2,
            ttl: 86400
        }).connect(connection.getRepository(ChatSession)),
        saveUninitialized: false,
        resave: false
    }))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            if (!route.annonymous) { //check userId in session only for routes without the annonymous flag
                let sess = req.session;
                if (!sess.userId) {
                    res.end('You need to first login!');
                    return;
                }
            }
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });
    app.listen(3000);
    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

}).catch(error => console.log(error));
