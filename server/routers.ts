import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { cryptoRouter } from "./routers/crypto";
import { authRouter } from "./routers/auth";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  crypto: cryptoRouter,
});

export type AppRouter = typeof appRouter;
