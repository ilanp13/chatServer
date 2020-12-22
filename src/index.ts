import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { CookieOptions } from "express-serve-static-core";
import { DataFillerController } from "./controller/DataFillerController";

const dbConfig = <MysqlConnectionOptions>{
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [
        __dirname + '/entity/*.ts'
    ]
}

createConnection(dbConfig).then(async connection => {
    // create express app
    const app = express();
    await (new DataFillerController()).createTables();

    const sessionConfig = {
        secret: 'dummy_secret',
        cookie: <CookieOptions>{},
        saveUninitialized: true,
        resave: false
    }
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1) // trust first proxy
        sessionConfig.cookie.secure = true // serve secure cookies
    }
    app.use(session(sessionConfig))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/health', (req: Request, res: Response, next: Function) => {
        res.json({ status: 200, Message: "server is up" })
    })

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
    console.log("Express server has started on port 3000. Open http://localhost:3000/health");

}).catch(error => console.log(error));
