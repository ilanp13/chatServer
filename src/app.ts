import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { CookieOptions } from "express-serve-static-core";

export const app = express();

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
