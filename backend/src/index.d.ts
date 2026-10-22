import type { IncomingMessage, ServerResponse } from "node:http";
export function getPageData(path: string): Promise<unknown>;
export function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>;
