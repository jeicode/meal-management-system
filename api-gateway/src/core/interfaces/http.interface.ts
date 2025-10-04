import { IncomingMessage, ServerResponse } from "http";
import { AnyObject } from "yup";

export interface Request extends IncomingMessage {
    query: Record<string, unknown>;
    body: Record<string, unknown>;
}


export interface Route {
  method: string;
  path: string;
  isSSE?: boolean;
  controller: (req: Request, res: ServerResponse) => Promise<void> | void;
  schema?: AnyObject; // Yup schema
  validateOn?: "body" | "query";
};
