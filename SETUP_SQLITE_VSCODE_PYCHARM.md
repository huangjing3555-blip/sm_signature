# 📚 SQLite3 + VSCode + PyCharm 完整配置指南

本指南专门为使用 SQLite3、VSCode 和 PyCharm 的开发者设计，详细说明每个命令在哪里输入。

---

## 🎯 工具介绍

| 工具 | 用途 | 在本项目中的作用 |
|------|------|-----------------|
| **VSCode** | 代码编辑器 | 编辑前端代码、后端代码、配置文件 |
| **PyCharm** | Python IDE | 编辑 Python 脚本、测试 GmSSL |
| **SQLite3** | 轻量级数据库 | 替代 MySQL，存储签名、哈希、密钥等数据 |
| **终端/命令行** | 命令执行工具 | 运行 npm、pnpm、Python 命令 |

---

## 📍 第一部分：命令输入位置说明

### 1️⃣ **VSCode 内置终端** (推荐用于 Node.js 命令)

#### 打开方式：

**方式 A：菜单栏**
```
顶部菜单 → Terminal → New Terminal
```

**方式 B：快捷键**
```
Windows/Linux: Ctrl + `
Mac: Cmd + `
```

**方式 C：右键菜单**
```
在项目文件夹上右键 → Open in Integrated Terminal
```

#### 样子：
```
在 VSCode 底部会出现一个黑色/白色的输入框
输入命令后按 Enter 执行
```

#### 在这里输入的命令：
```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm build            # 构建项目
npm install -g pnpm   # 安装 pnpm
```

---

### 2️⃣ **系统终端/命令提示符** (用于数据库和系统命令)

#### Windows 用户

**方式 A：搜索打开**
```
按 Win + R → 输入 cmd → 按 Enter
或
按 Win 键 → 输入 "命令提示符" → 按 Enter
```

**方式 B：右键打开**
```
在文件夹空白处右键 → 在此处打开命令窗口
```

**样子**：
```
黑色窗口，显示 C:\Users\YourName>
```

#### macOS 用户

**方式 A：Spotlight 搜索**
```
按 Cmd + Space → 输入 "terminal" → 按 Enter
```

**方式 B：Finder 打开**
```
Applications → Utilities → Terminal
```

**样子**：
```
黑色/白色窗口，显示 YourName@MacBook ~ %
```

#### Linux 用户

**方式 A：快捷键**
```
Ctrl + Alt + T
```

**方式 B：应用菜单**
```
点击应用菜单 → 搜索 "Terminal"
```

**样子**：
```
黑色窗口，显示 username@hostname:~$
```

#### 在这里输入的命令：
```bash
sqlite3 sm_signature.db       # 打开 SQLite 数据库
python3 --version             # 检查 Python 版本
pip3 install gmssl            # 安装 GmSSL
```

---

### 3️⃣ **PyCharm 内置终端** (用于 Python 命令)

#### 打开方式：

**方式 A：菜单栏**
```
View → Tool Windows → Terminal
```

**方式 B：快捷键**
```
Alt + F12 (Windows/Linux)
Cmd + Option + F12 (Mac)
```

**方式 C：底部工具栏**
```
点击 PyCharm 底部的 "Terminal" 标签
```

#### 样子：
```
在 PyCharm 底部出现一个输入框
显示类似 (venv) C:\path\to\project>
```

#### 在这里输入的命令：
```bash
python3 -c "import gmssl; print('✓ GmSSL 已安装')"
python3 << 'EOF'
from gmssl import sm3
msg = "hello world"
hash_result = sm3.sm3_hash(msg.encode())
print(f"SM3 哈希: {hash_result}")
EOF
```

---

## 🔧 第二部分：SQLite3 配置步骤

### 步骤 1：修改项目配置文件

#### 在 VSCode 中打开 `drizzle.config.ts`

1. 打开 VSCode
2. 按 `Ctrl + O` (Mac: `Cmd + O`)
3. 选择项目文件夹中的 `drizzle.config.ts`
4. 找到以下内容：

```typescript
// 原内容（MySQL）
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: "localhost",
    user: "sm_user",
    password: "sm_password_123",
    database: "sm_signature_system",
  },
});
```

5. **替换为以下内容**（SQLite3）：

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./sm_signature.db",
  },
});
```

6. 按 `Ctrl + S` (Mac: `Cmd + S`) 保存

---

### 步骤 2：修改 `.env` 文件

#### 在 VSCode 中打开 `.env`

1. 按 `Ctrl + O` 打开文件
2. 选择 `.env` 文件
3. 找到 `DATABASE_URL` 这一行
4. **替换为**：

```env
DATABASE_URL="file:./sm_signature.db"
```

5. 保存文件 (`Ctrl + S`)

---

### 步骤 3：修改 `server/db.ts` 文件

#### 在 VSCode 中打开 `server/db.ts`

1. 打开 VSCode
2. 按 `Ctrl + P` (Mac: `Cmd + P`)
3. 输入 `server/db.ts`
4. 找到以下代码：

```typescript
import { drizzle } from "drizzle-orm/mysql2";
```

5. **替换为**：

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
```

6. 找到以下代码：

```typescript
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
```

7. **替换为**：

```typescript
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const db = new Database(process.env.DATABASE_URL.replace("file:", ""));
      _db = drizzle(db);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
```

8. 保存文件

---

### 步骤 4：在 VSCode 终端中安装 SQLite 驱动

1. **打开 VSCode 终端** (Ctrl + `)
2. **输入以下命令**：

```bash
pnpm add better-sqlite3
```

3. **按 Enter 执行**
4. 等待安装完成（显示 `added X packages`）

---

### 步骤 5：在 VSCode 终端中生成数据库迁移

1. **在 VSCode 终端中输入**：

```bash
pnpm drizzle-kit generate
```

2. **按 Enter 执行**
3. 应该看到输出：
```
Reading schema files:
/path/to/sm-signature-system/drizzle/schema.ts
5 tables
```

---

### 步骤 6：在 VSCode 终端中执行数据库迁移

1. **在 VSCode 终端中输入**：

```bash
pnpm drizzle-kit migrate
```

2. **按 Enter 执行**
3. 应该看到输出：
```
✓ Migrations applied successfully
```

---

## 🐍 第三部分：PyCharm 中配置 Python 和 GmSSL

### 步骤 1：在 PyCharm 中打开项目

1. 打开 PyCharm
2. 点击 `File → Open`
3. 选择 `sm-signature-system` 文件夹
4. 点击 `Open`

---

### 步骤 2：配置 Python 解释器

1. 点击 `PyCharm → Preferences` (Mac) 或 `File → Settings` (Windows/Linux)
2. 左侧菜单找到 `Project: sm-signature-system → Python Interpreter`
3. 点击右上角的齿轮图标 ⚙️
4. 选择 `Add...`
5. 选择 `System Interpreter` 或 `Existing Environment`
6. 选择您的 Python 3.8+ 版本
7. 点击 `OK`

---

### 步骤 3：在 PyCharm 终端中安装 GmSSL

1. **打开 PyCharm 终端** (Alt + F12 或 View → Tool Windows → Terminal)
2. **输入以下命令**：

```bash
pip3 install gmssl
```

3. **按 Enter 执行**
4. 等待安装完成

---

### 步骤 4：在 PyCharm 中测试 GmSSL

1. 在 PyCharm 中创建新文件：`test_gmssl.py`
2. **输入以下代码**：

```python
from gmssl import sm3, sm2

# 测试 SM3 哈希
print("=== 测试 SM3 哈希 ===")
msg = "hello world"
hash_result = sm3.sm3_hash(msg.encode())
print(f"消息: {msg}")
print(f"SM3 哈希: {hash_result}")

# 测试 SM2 密钥生成
print("\n=== 测试 SM2 密钥生成 ===")
private_key = sm2.generate_private_key()
public_key = sm2.get_public_key_from_private_key(private_key)
print(f"私钥: {private_key[:20]}...")
print(f"公钥: {public_key[:20]}...")
print("✓ SM2 密钥生成成功")
```

3. **右键点击文件** → `Run 'test_gmssl'`
4. 或按 `Ctrl + Shift + F10` (Windows/Linux) 或 `Ctrl + Shift + R` (Mac)
5. 在底部的 `Run` 窗口中查看输出

---

## 📝 第四部分：完整的本地配置流程

### 总体流程图

```
1. 在 VSCode 中修改配置文件
   ↓
2. 在 VSCode 终端中安装依赖
   ↓
3. 在 VSCode 终端中生成数据库迁移
   ↓
4. 在 VSCode 终端中执行数据库迁移
   ↓
5. 在 PyCharm 中测试 GmSSL
   ↓
6. 在 VSCode 终端中启动开发服务器
   ↓
7. 在浏览器中访问 http://localhost:3000
```

---

## ✅ 完整操作步骤 (按顺序执行)

### 第 1 步：在 VSCode 中修改配置

| 操作 | 位置 | 具体步骤 |
|------|------|---------|
| 打开 VSCode | 桌面/开始菜单 | 双击 VSCode 图标 |
| 打开项目 | VSCode 菜单 | File → Open Folder → 选择项目文件夹 |
| 打开 `drizzle.config.ts` | VSCode 文件树 | 左侧文件树 → 点击 `drizzle.config.ts` |
| 修改内容 | 编辑器中央 | 按照上面的说明修改代码 |
| 保存文件 | 编辑器 | Ctrl + S (或 Cmd + S) |
| 打开 `.env` 文件 | VSCode 文件树 | 左侧文件树 → 点击 `.env` |
| 修改 DATABASE_URL | 编辑器中央 | 改为 `file:./sm_signature.db` |
| 保存文件 | 编辑器 | Ctrl + S |
| 打开 `server/db.ts` | VSCode 搜索 | Ctrl + P → 输入 `server/db.ts` |
| 修改导入语句 | 编辑器中央 | 按照上面的说明修改 |
| 修改 getDb 函数 | 编辑器中央 | 按照上面的说明修改 |
| 保存文件 | 编辑器 | Ctrl + S |

---

### 第 2 步：在 VSCode 终端中运行命令

| 步骤 | 命令 | 在哪里输入 | 预期输出 |
|------|------|----------|---------|
| 1 | `pnpm add better-sqlite3` | VSCode 底部终端 | `added X packages` |
| 2 | `pnpm drizzle-kit generate` | VSCode 底部终端 | `Reading schema files...` |
| 3 | `pnpm drizzle-kit migrate` | VSCode 底部终端 | `✓ Migrations applied` |

**如何打开 VSCode 终端**：
- 按 `Ctrl + `` (反引号)
- 或点击菜单 Terminal → New Terminal

---

### 第 3 步：在 PyCharm 中测试 GmSSL

| 步骤 | 操作 | 位置 |
|------|------|------|
| 1 | 打开 PyCharm | 桌面/开始菜单 |
| 2 | 打开项目 | File → Open → 选择项目文件夹 |
| 3 | 打开终端 | Alt + F12 或 View → Tool Windows → Terminal |
| 4 | 安装 GmSSL | 在 PyCharm 终端输入 `pip3 install gmssl` |
| 5 | 创建测试文件 | 右键项目 → New → Python File → 输入 `test_gmssl.py` |
| 6 | 输入测试代码 | 在编辑器中粘贴上面的代码 |
| 7 | 运行测试 | 右键 → Run 'test_gmssl' 或 Ctrl + Shift + F10 |
| 8 | 查看结果 | 底部 Run 窗口 |

---

### 第 4 步：在 VSCode 中启动开发服务器

| 步骤 | 命令 | 在哪里输入 | 预期输出 |
|------|------|----------|---------|
| 1 | `pnpm install` | VSCode 底部终端 | `done in X.XXs` |
| 2 | `pnpm dev` | VSCode 底部终端 | `Server running on http://localhost:3000/` |

---

### 第 5 步：在浏览器中访问应用

1. 打开任意浏览器 (Chrome、Firefox、Edge 等)
2. 在地址栏输入：`http://localhost:3000`
3. 按 Enter
4. 应该看到国密 SM2/SM3 数字签名系统的首页

---

## 🗄️ 第五部分：SQLite 数据库管理

### 查看 SQLite 数据库

#### 方式 1：在系统终端中使用 sqlite3 命令

**Windows 用户**：
```
1. 按 Win + R
2. 输入 cmd 并按 Enter
3. 输入: sqlite3 sm_signature.db
4. 输入: .tables (查看所有表)
5. 输入: .schema (查看表结构)
6. 输入: .quit (退出)
```

**Mac/Linux 用户**：
```
1. 打开 Terminal
2. 进入项目目录: cd /path/to/sm-signature-system
3. 输入: sqlite3 sm_signature.db
4. 输入: .tables (查看所有表)
5. 输入: .quit (退出)
```

#### 方式 2：在 VSCode 中使用扩展

1. 打开 VSCode
2. 点击左侧扩展图标 (或按 Ctrl + Shift + X)
3. 搜索 `SQLite`
4. 安装 `SQLite` 扩展 (作者: alexcvzz)
5. 打开 VSCode 命令面板 (Ctrl + Shift + P)
6. 输入 `SQLite: Open Database`
7. 选择 `sm_signature.db`
8. 在左侧会看到数据库结构

#### 方式 3：使用 SQLite 图形化工具

下载并安装以下工具之一：
- **DB Browser for SQLite** (免费): https://sqlitebrowser.org/
- **DBeaver** (免费): https://dbeaver.io/
- **DataGrip** (付费): https://www.jetbrains.com/datagrip/

---

## 🧪 第六部分：测试所有功能

### 测试 1：SM2 密钥生成

1. 打开浏览器，访问 `http://localhost:3000`
2. 点击左侧菜单 "密钥生成"
3. 输入密钥名称 (如: "测试密钥")
4. 点击 "生成 SM2 密钥对"
5. **验证**：
   - ✓ 公钥显示 (128 字符)
   - ✓ 私钥显示 (128 字符)
   - ✓ 可以下载文件

### 测试 2：SM3 哈希计算

1. 点击左侧菜单 "SM3 哈希"
2. 输入文本 (如: "hello world")
3. 点击 "计算 SM3 哈希"
4. **验证**：
   - ✓ 哈希值显示 (64 字符十六进制)
   - ✓ 与 PyCharm 测试结果一致

### 测试 3：数字签名

1. 点击左侧菜单 "数字签名"
2. 选择之前生成的密钥
3. 输入消息
4. 点击 "对消息进行 SM2 签名"
5. **验证**：
   - ✓ 签名值显示
   - ✓ 可以复制签名

### 测试 4：签名验证

1. 点击左侧菜单 "签名验证"
2. 粘贴原始消息
3. 粘贴签名值
4. 粘贴公钥
5. 点击 "验证 SM2 签名"
6. **验证**：
   - ✓ 显示 "✓ 通过" 或 "✗ 失败"

### 测试 5：查看数据库

1. 打开 VSCode 或 DB Browser
2. 打开 `sm_signature.db`
3. 查看表：
   - `sm2_keys` - 存储的密钥
   - `sm3_hashes` - 计算的哈希
   - `signatures` - 签名记录
   - `verifications` - 验证记录
4. **验证**：
   - ✓ 数据正确保存
   - ✓ 时间戳正确

---

## 📊 快速参考表

### 命令输入位置

| 命令类型 | 输入位置 | 打开方式 |
|---------|---------|---------|
| Node.js / npm / pnpm | VSCode 终端 | Ctrl + ` |
| Python / pip / gmssl | PyCharm 终端 | Alt + F12 |
| SQLite / 系统命令 | 系统终端 | Win+R (Windows) / Cmd+Space (Mac) / Ctrl+Alt+T (Linux) |
| 代码编辑 | VSCode 编辑器 | 直接在中央区域编辑 |
| 数据库查看 | SQLite 工具 | VSCode 扩展或 DB Browser |

---

## 🎯 常见问题速查表

| 问题 | 解决方案 | 在哪里执行 |
|------|---------|----------|
| `pnpm: command not found` | `npm install -g pnpm` | VSCode 终端 |
| `better-sqlite3 not found` | `pnpm add better-sqlite3` | VSCode 终端 |
| `gmssl: No module named` | `pip3 install gmssl` | PyCharm 终端 |
| 数据库文件不存在 | `pnpm drizzle-kit migrate` | VSCode 终端 |
| 端口 3000 被占用 | `PORT=3001 pnpm dev` | VSCode 终端 |
| 看不到数据库表 | 打开 DB Browser 或 VSCode SQLite 扩展 | 系统应用 |

---

## 📚 文件修改总结

| 文件 | 修改内容 | 在哪里修改 |
|------|---------|----------|
| `drizzle.config.ts` | 改用 SQLite 配置 | VSCode 编辑器 |
| `.env` | 改 DATABASE_URL 为 SQLite 路径 | VSCode 编辑器 |
| `server/db.ts` | 改用 better-sqlite3 驱动 | VSCode 编辑器 |
| `package.json` | 自动添加 better-sqlite3 依赖 | 无需手动修改 |

---

## ✅ 最终检查清单

在启动开发服务器前，确保以下所有项都已完成：

- [ ] VSCode 已打开项目
- [ ] `drizzle.config.ts` 已修改为 SQLite
- [ ] `.env` 中 DATABASE_URL 已改为 SQLite 路径
- [ ] `server/db.ts` 已修改为使用 better-sqlite3
- [ ] 在 VSCode 终端中运行了 `pnpm add better-sqlite3`
- [ ] 在 VSCode 终端中运行了 `pnpm drizzle-kit generate`
- [ ] 在 VSCode 终端中运行了 `pnpm drizzle-kit migrate`
- [ ] PyCharm 中已安装 gmssl (`pip3 install gmssl`)
- [ ] PyCharm 中的 GmSSL 测试已通过
- [ ] `sm_signature.db` 文件已创建
- [ ] 在 VSCode 终端中运行了 `pnpm install`
- [ ] 在 VSCode 终端中运行了 `pnpm dev`
- [ ] 浏览器可以访问 `http://localhost:3000`

---

## 🚀 下一步

完成所有步骤后，您可以：

1. **测试所有功能** - 按照第六部分的步骤测试
2. **生产构建** - 在 VSCode 终端中运行 `pnpm build`
3. **部署到香橙派** - 参考 `DEPLOYMENT_GUIDE.md`

---

**最后更新**：2026年5月3日  
**版本**：1.0
