
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            validated?: {
                body?: unknown;
                query?: unknown;
                params?: unknown;
            };
            user?: {
                id: string;
                role: "admin" | "teacher" | "student";
                sessionId: string;
            }
        }
    }
}
export {}