// types/express.d.ts
declare module 'express-serve-static-core' {
    interface Request {
        user?: { sub: number; username: string; email: string };
    }
}
