import { IncomingMessage } from "http";

export interface Request extends IncomingMessage {
    query: Record<string, any>;
    body: Record<string, any>;
}