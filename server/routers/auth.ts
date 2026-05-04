/**
 * 本地认证路由 - 用户名/密码登录
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { loginUser, logoutUser, registerUser } from "../auth-local";

export const authRouter = router({
  /**
   * 用户登录
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const result = loginUser(input.username, input.password);

      if (!result) {
        throw new Error("Invalid username or password");
      }

      return {
        success: true,
        token: result.token,
        user: result.user,
      };
    }),

  /**
   * 用户注册
   */
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        name: z.string().min(1),
        email: z.string().email(),
      })
    )
    .mutation(({ input }) => {
      const result = registerUser(input.username, input.password, input.name, input.email);

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        user: result.user,
      };
    }),

  /**
   * 用户登出
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    // 这里可以添加 logout 逻辑
    // 前端需要删除 token
    return {
      success: true,
    };
  }),

  /**
   * 获取当前用户信息
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    return {
      id: ctx.user.id,
      username: ctx.user.username,
    };
  }),
});
