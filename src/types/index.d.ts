export { };

declare module 'express-session' {
    interface SessionData {
        userId: number;
        username: string;
    }
}
declare global {
    interface Date {
        getMysqlFormat(): string;
    }
}
