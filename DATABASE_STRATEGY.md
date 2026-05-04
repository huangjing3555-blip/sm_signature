# 📊 数据库部署策略：本地 SQLite vs 香橙派 MySQL

这是一个非常重要的问题！本文档详细解释如何处理本地开发和香橙派部署的数据库差异。

---

## 🎯 核心问题

**您的疑问**：
> "我在电脑上用 SQLite，把代码配置改了之后，香橙派部署是不是也要下载 SQLite？不然不匹配？"

**简短回答**：
✅ **是的，需要保持一致**，但有 **3 种解决方案**，您可以选择最适合的。

---

## 📋 三种解决方案对比

| 方案 | 本地开发 | 香橙派部署 | 优点 | 缺点 | 推荐度 |
|------|---------|----------|------|------|--------|
| **方案 A** | SQLite | SQLite | 完全一致，部署简单 | 生产环境不稳定 | ⭐⭐⭐ |
| **方案 B** | SQLite | MySQL | 开发快速，生产稳定 | 需要两套配置 | ⭐⭐⭐⭐⭐ |
| **方案 C** | MySQL | MySQL | 完全一致，最专业 | 本地配置复杂 | ⭐⭐⭐⭐ |

---

## 🔍 详细方案说明

### 方案 A：本地和香橙派都用 SQLite

#### ✅ 优点
- 配置完全一致，无需维护两套代码
- 部署最简单，直接复制数据库文件即可
- 开发快速，无需安装 MySQL
- 适合小型项目和个人开发

#### ❌ 缺点
- SQLite 是单文件数据库，并发性能差
- 不适合生产环境（多用户同时访问会出现锁定）
- 无法远程访问数据库
- 数据备份和恢复不方便

#### 📝 实施步骤

**本地开发**：
```bash
# 已经配置好了
# drizzle.config.ts 使用 SQLite
# .env 中 DATABASE_URL="file:./sm_signature.db"
# server/db.ts 使用 better-sqlite3
```

**香橙派部署**：
```bash
# 1. 上传项目文件到香橙派
scp -r sm-signature-system orangepi@192.168.1.XXX:/home/orangepi/

# 2. 在香橙派上安装依赖
cd /home/orangepi/sm-signature-system
pnpm install

# 3. 生成数据库
pnpm drizzle-kit migrate

# 4. 启动服务
pnpm build
pnpm start

# 就这样！SQLite 数据库会自动创建
```

#### 🎯 适用场景
- 个人使用或小团队（≤ 5 人）
- 签名操作不频繁（每天 < 100 次）
- 不需要 24/7 高可用性
- **推荐用于学习和演示**

---

### 方案 B：本地 SQLite，香橙派 MySQL（推荐 ⭐⭐⭐⭐⭐）

#### ✅ 优点
- 本地开发快速简单（无需安装 MySQL）
- 香橙派生产环境稳定（MySQL 支持高并发）
- 最符合实际生产场景
- 易于扩展和维护

#### ❌ 缺点
- 需要维护两套数据库配置
- 本地和香橙派的表结构必须保持同步
- 需要编写环境切换逻辑

#### 📝 实施步骤

**第 1 步：本地保持 SQLite 配置**

```bash
# 已经配置好了，无需改动
# drizzle.config.ts 使用 SQLite
# .env 中 DATABASE_URL="file:./sm_signature.db"
# server/db.ts 使用 better-sqlite3
```

**第 2 步：创建香橙派专用配置**

在项目根目录创建 `.env.orangepi` 文件：

```env
# 香橙派使用 MySQL
DATABASE_URL="mysql://sm_user:sm_password_123@localhost:3306/sm_signature_system"
NODE_ENV="production"
JWT_SECRET="your-random-secret-key-here-min-32-chars-long"
```

**第 3 步：修改 `server/db.ts` 支持两种数据库**

```typescript
import { getDb } from "./db";

export async function initializeDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (dbUrl?.includes("file:")) {
    // 本地开发：SQLite
    console.log("[Database] Using SQLite (local development)");
    return await initSqlite();
  } else if (dbUrl?.includes("mysql://")) {
    // 香橙派生产：MySQL
    console.log("[Database] Using MySQL (production)");
    return await initMysql();
  } else {
    throw new Error("DATABASE_URL not configured");
  }
}

async function initSqlite() {
  const Database = require("better-sqlite3");
  const db = new Database(process.env.DATABASE_URL.replace("file:", ""));
  return drizzle(db);
}

async function initMysql() {
  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  return drizzle(connection);
}
```

**第 4 步：本地测试**

```bash
# 本地开发（SQLite）
pnpm dev

# 验证功能正常
```

**第 5 步：香橙派部署**

```bash
# 1. 在香橙派上安装 MySQL
sudo apt install -y mysql-server

# 2. 创建数据库和用户
mysql -u root -e "
CREATE DATABASE sm_signature_system CHARACTER SET utf8mb4;
CREATE USER 'sm_user'@'localhost' IDENTIFIED BY 'sm_password_123';
GRANT ALL PRIVILEGES ON sm_signature_system.* TO 'sm_user'@'localhost';
FLUSH PRIVILEGES;
"

# 3. 上传项目
scp -r sm-signature-system orangepi@192.168.1.XXX:/home/orangepi/

# 4. 在香橙派上配置
cd /home/orangepi/sm-signature-system
cp .env.orangepi .env

# 5. 安装依赖
pnpm install

# 6. 生成数据库迁移（使用 MySQL 配置）
pnpm drizzle-kit generate

# 7. 执行迁移
pnpm drizzle-kit migrate

# 8. 构建和启动
pnpm build
pnpm start
```

#### 🎯 适用场景
- **最推荐的方案**
- 本地快速开发，香橙派稳定生产
- 团队项目（5-50 人）
- 需要可靠性和可扩展性

---

### 方案 C：本地和香橙派都用 MySQL

#### ✅ 优点
- 配置完全一致
- 本地开发环境与生产环境相同
- 最专业的做法
- 便于发现环境相关的 bug

#### ❌ 缺点
- 本地需要安装 MySQL（增加复杂性）
- 占用更多系统资源
- 配置较复杂

#### 📝 实施步骤

**本地安装 MySQL**：

Windows：
```powershell
choco install mysql
```

macOS：
```bash
brew install mysql
brew services start mysql
```

Linux：
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
```

**本地配置**：

```bash
# 创建数据库
mysql -u root -e "
CREATE DATABASE sm_signature_system CHARACTER SET utf8mb4;
CREATE USER 'sm_user'@'localhost' IDENTIFIED BY 'sm_password_123';
GRANT ALL PRIVILEGES ON sm_signature_system.* TO 'sm_user'@'localhost';
FLUSH PRIVILEGES;
"

# 配置 .env
DATABASE_URL="mysql://sm_user:sm_password_123@localhost:3306/sm_signature_system"

# 配置 drizzle.config.ts
# dialect: "mysql"

# 配置 server/db.ts
# 使用 drizzle-orm/mysql2

# 生成和执行迁移
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

**香橙派部署**：

```bash
# 完全相同的步骤，无需任何改动
```

#### 🎯 适用场景
- 企业级项目
- 需要完全一致的开发和生产环境
- 团队规模 > 50 人

---

## 🚀 推荐方案：方案 B（本地 SQLite + 香橙派 MySQL）

### 为什么推荐方案 B？

```
┌─────────────────────────────────────────────────────────────┐
│                     方案 B 的优势                            │
├─────────────────────────────────────────────────────────────┤
│ ✅ 本地开发快速（无需 MySQL）                               │
│ ✅ 香橙派生产稳定（MySQL 支持高并发）                       │
│ ✅ 符合实际生产场景                                         │
│ ✅ 易于维护和扩展                                           │
│ ✅ 成本最低（本地无需额外配置）                             │
│ ✅ 最适合个人开发者和小团队                                 │
└─────────────────────────────────────────────────────────────┘
```

### 方案 B 的实施流程

```
本地开发（SQLite）
    ↓
编写代码和测试
    ↓
在本地验证功能
    ↓
上传到香橙派
    ↓
在香橙派配置 MySQL
    ↓
执行数据库迁移
    ↓
启动服务
    ↓
✅ 完成！
```

---

## 📝 关键要点

### 1️⃣ 数据库迁移文件是通用的

```
✅ 好消息：Drizzle 生成的 SQL 迁移文件对 SQLite 和 MySQL 都适用
❌ 注意：某些 SQL 语法可能不同（如 AUTOINCREMENT vs AUTO_INCREMENT）
```

### 2️⃣ 代码无需改动

```typescript
// 这段代码对 SQLite 和 MySQL 都有效
import { eq } from "drizzle-orm";
import { sm2Keys } from "../drizzle/schema";

// 查询语句完全相同
const keys = await db.select().from(sm2Keys).where(eq(sm2Keys.userId, userId));
```

### 3️⃣ 只需改动配置文件

```
需要改动的文件：
✅ .env（数据库连接字符串）
✅ drizzle.config.ts（数据库方言）
✅ server/db.ts（数据库驱动）

不需要改动的文件：
✅ drizzle/schema.ts（表定义）
✅ server/routers.ts（业务逻辑）
✅ client/src/（前端代码）
```

---

## ✅ 完整检查清单

### 如果选择方案 A（本地和香橙派都用 SQLite）

- [ ] 本地已配置 SQLite
- [ ] `drizzle.config.ts` 使用 SQLite 方言
- [ ] `.env` 中 DATABASE_URL 为 SQLite 路径
- [ ] `server/db.ts` 使用 better-sqlite3
- [ ] 本地测试通过
- [ ] 香橙派已安装 Node.js 和 pnpm
- [ ] 香橙派已安装 better-sqlite3 依赖
- [ ] 香橙派数据库迁移成功
- [ ] 香橙派服务启动成功

### 如果选择方案 B（本地 SQLite + 香橙派 MySQL）⭐ 推荐

- [ ] 本地已配置 SQLite
- [ ] 创建了 `.env.orangepi` 文件
- [ ] `server/db.ts` 支持两种数据库
- [ ] 本地测试通过
- [ ] 香橙派已安装 MySQL
- [ ] 香橙派已创建数据库和用户
- [ ] 上传了 `.env.orangepi` 到香橙派
- [ ] 香橙派数据库迁移成功
- [ ] 香橙派服务启动成功

### 如果选择方案 C（本地和香橙派都用 MySQL）

- [ ] 本地已安装 MySQL
- [ ] 本地已创建数据库和用户
- [ ] `.env` 中 DATABASE_URL 为 MySQL 连接字符串
- [ ] `drizzle.config.ts` 使用 MySQL 方言
- [ ] `server/db.ts` 使用 mysql2 驱动
- [ ] 本地测试通过
- [ ] 香橙派已安装 MySQL
- [ ] 香橙派已创建数据库和用户
- [ ] 香橙派数据库迁移成功
- [ ] 香橙派服务启动成功

---

## 🎯 我的建议

### 对于您的情况（本地 SQLite + 香橙派部署）

**第 1 步：继续使用本地 SQLite**

```bash
# 保持现有配置不变
# 本地开发继续使用 SQLite
pnpm dev
```

**第 2 步：为香橙派准备 MySQL 配置**

```bash
# 创建 .env.orangepi 文件
# 在其中配置 MySQL 连接字符串
```

**第 3 步：修改 server/db.ts 支持两种数据库**

```typescript
// 添加逻辑来自动检测使用哪种数据库
if (process.env.DATABASE_URL.includes("file:")) {
  // 使用 SQLite
} else if (process.env.DATABASE_URL.includes("mysql://")) {
  // 使用 MySQL
}
```

**第 4 步：本地验证所有功能**

```bash
pnpm dev
# 测试所有功能
```

**第 5 步：部署到香橙派**

```bash
# 上传项目
scp -r sm-signature-system orangepi@192.168.1.XXX:/home/orangepi/

# 在香橙派上
cd /home/orangepi/sm-signature-system
cp .env.orangepi .env
pnpm install
pnpm drizzle-kit migrate
pnpm build
pnpm start
```

---

## 📞 常见问题

### Q1: 本地用 SQLite，香橙派用 MySQL，数据会丢失吗？

**A**: 是的，会丢失。SQLite 和 MySQL 是两个独立的数据库系统。

**解决方案**：
```bash
# 方案 1：在香橙派上重新创建数据
# 方案 2：导出本地数据并导入到香橙派
# 方案 3：使用方案 A（都用 SQLite）或方案 C（都用 MySQL）
```

### Q2: 如何在本地和香橙派之间同步数据？

**A**: 可以使用以下方法：

```bash
# 方法 1：导出 SQLite 数据为 SQL
sqlite3 sm_signature.db ".dump" > backup.sql

# 方法 2：导入到 MySQL
mysql -u sm_user -p sm_signature_system < backup.sql

# 方法 3：使用数据迁移脚本
# 编写 Python 脚本读取 SQLite，写入 MySQL
```

### Q3: 生产环境一定要用 MySQL 吗？

**A**: 不一定，但强烈推荐。

```
SQLite 适合：
✅ 单用户应用
✅ 读多写少的场景
✅ 不需要高并发

MySQL 适合：
✅ 多用户应用
✅ 高并发场景
✅ 需要远程访问
✅ 生产环境
```

### Q4: 如何在香橙派上备份 MySQL 数据库？

**A**: 使用 mysqldump 命令：

```bash
# 备份
mysqldump -u sm_user -p sm_signature_system > backup.sql

# 恢复
mysql -u sm_user -p sm_signature_system < backup.sql
```

---

## 🚀 下一步

根据您的选择，按照相应的方案实施：

- **选择方案 A**：直接部署到香橙派，使用相同的 SQLite 配置
- **选择方案 B**：创建 `.env.orangepi`，修改 `server/db.ts`，部署时切换配置
- **选择方案 C**：本地安装 MySQL，保持配置完全一致

**我的强烈推荐**：使用 **方案 B**（本地 SQLite + 香橙派 MySQL）

---

**最后更新**：2026年5月3日  
**版本**：1.0
