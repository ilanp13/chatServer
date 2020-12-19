export { };

declare module 'express-session' {
    interface SessionData {
        userId: number;
        username: string;
    }
}
