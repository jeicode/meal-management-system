import { IncomingMessage, ServerResponse } from "http";

export interface Request extends IncomingMessage {
    query: Record<string, any>;
    body: Record<string, any>;
}


export interface Route {
  method: string;
  path: string;
  isSSE?: boolean;
  controller: (req: Request, res: ServerResponse) => Promise<void> | void;
  schema?: any; // Yup schema opcional
  validateOn?: "body" | "query";
};
