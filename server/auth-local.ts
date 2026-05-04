/**
 * 本地认证系统 - 不使用 OAuth
 * 简单的用户名/密码认证
 */

import * as crypto from "crypto";
import { Request, Response } from "express";

// 简单的内存用户存储（生产环境应使用数据库）
const users: Map<
  string,
  {
    username: string;
    passwordHash: string;
    id: number;
    name: string;
    email: string;
  }
> = new Map();

// 初始化默认用户
function initializeDefaultUsers() {
  // 默认用户：admin / admin123
  const adminHash = hashPassword("admin123");
  users.set("admin", {
    username: "admin",
    passwordHash: adminHash,
    id: 1,
    name: "Administrator",
    email: "admin@localhost",
  });

  console.log("[Auth] Default user created: admin / admin123");
}

// 密码哈希函数
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// 生成 Session Token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// 存储 token 到 session（内存存储，生产环境应使用 Redis）
const sessions: Map<
  string,
  {
    username: string;
    userId: number;
    createdAt: Date;
  }
> = new Map();

/**
 * 用户登录
 */
export function loginUser(username: string, password: string): { token: string; user: any } | null {
  const user = users.get(username);

  if (!user) {
    console.warn(`[Auth] Login failed: user not found - ${username}`);
    return null;
  }

  const passwordHash = hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    console.warn(`[Auth] Login failed: invalid password - ${username}`);
    return null;
  }

  // 生成 token
  const token = generateToken();
  sessions.set(token, {
    username: user.username,
    userId: user.id,
    createdAt: new Date(),
  });

  console.log(`[Auth] User logged in: ${username}`);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    },
  };
}

/**
 * 用户注册（可选）
 */
export function registerUser(
  username: string,
  password: string,
  name: string,
  email: string
): { success: boolean; message: string; user?: any } {
  if (users.has(username)) {
    return {
      success: false,
      message: "Username already exists",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters",
    };
  }

  const userId = users.size + 1;
  const passwordHash = hashPassword(password);

  users.set(username, {
    username,
    passwordHash,
    id: userId,
    name,
    email,
  });

  console.log(`[Auth] New user registered: ${username}`);

  return {
    success: true,
    message: "User registered successfully",
    user: {
      id: userId,
      username,
      name,
      email,
    },
  };
}

/**
 * 验证 Token
 */
export function verifyToken(token: string): { id: number; username: string } | null {
  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  // 检查 session 是否过期（24 小时）
  const now = new Date();
  const sessionAge = now.getTime() - session.createdAt.getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 小时

  if (sessionAge > maxAge) {
    sessions.delete(token);
    return null;
  }

  return {
    id: session.userId,
    username: session.username,
  };
}

/**
 * 用户登出
 */
export function logoutUser(token: string): boolean {
  return sessions.delete(token);
}

/**
 * 从请求中提取 token
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 从 Authorization header 中获取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 从 Cookie 中获取
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/auth_token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }

  return null;
}

/**
 * 初始化认证系统
 */
export function initializeAuth() {
  initializeDefaultUsers();
  console.log("[Auth] Local authentication system initialized");
}

/**
 * 获取所有用户（仅用于调试）
 */
export function getAllUsers() {
  const userList: any[] = [];
  users.forEach((user) => {
    userList.push({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    });
  });
  return userList;
}
