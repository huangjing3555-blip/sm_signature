import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyToken, extractTokenFromRequest } from "../auth-local";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: { id: number; username: string } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: { id: number; username: string } | null = null;

  // 从请求中提取 token
  const token = extractTokenFromRequest(opts.req);

  if (token) {
    // 验证 token
    const verified = verifyToken(token);
    if (verified) {
      user = verified;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
