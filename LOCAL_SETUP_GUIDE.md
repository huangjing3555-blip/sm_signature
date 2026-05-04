# 本地开发环境完整配置指南

本指南将帮助您在本地（Windows/Mac/Linux）完全跑通国密 SM2/SM3 数字签名系统，然后部署到香橙派 5 Plus。

---

## 📋 第一步：环境检查与准备

### 1.1 系统要求

| 项目 | 要求 | 检查命令 |
|------|------|---------|
| **操作系统** | Windows 10+、macOS 10.15+、Linux (Ubuntu 20.04+) | `uname -a` |
| **Node.js** | v22.0 或更高 | `node --version` |
| **npm** | v10.0 或更高 | `npm --version` |
| **Git** | 最新版本 | `git --version` |
| **Python** | v3.8 或更高 | `python3 --version` |

### 1.2 安装必要工具

#### Windows 用户

```powershell
# 使用 Chocolatey 安装 (需要管理员权限)
choco install nodejs git python3

# 或者使用 scoop
scoop install nodejs git python
```

#### macOS 用户

```bash
# 使用 Homebrew 安装
brew install node git python3
```

#### Linux 用户 (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y nodejs npm git python3 python3-pip build-essential
```

### 1.3 验证环装

```bash
# 检查所有工具版本
node --version      # 应为 v22.x.x
npm --version       # 应为 10.x.x
git --version       # 应为 2.x.x
python3 --version   # 应为 3.8+
```

---

## 📦 第二步：项目初始化

### 2.1 解压项目文件

```bash
# 解压 ZIP 文件
unzip sm-signature-system-complete.zip
cd sm-signature-system
```

### 2.2 安装全局工具

```bash
# 安装 pnpm (推荐的包管理器)
npm install -g pnpm

# 验证安装
pnpm --version      # 应为 10.x.x
```

### 2.3 安装项目依赖

```bash
# 进入项目目录
cd sm-signature-system

# 安装所有依赖
pnpm install

# 验证依赖安装
pnpm list | head -20
```

**预期输出**：应该看到 React、Express、tRPC 等依赖包列表。

---

## 🗄️ 第三步：数据库配置

### 3.1 安装 MySQL

#### Windows

```powershell
# 使用 Chocolatey
choco install mysql

# 或从官网下载: https://dev.mysql.com/downloads/mysql/
```

#### macOS

```bash
# 使用 Homebrew
brew install mysql

# 启动 MySQL 服务
brew services start mysql
```

#### Linux (Ubuntu)

```bash
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 3.2 初始化 MySQL

```bash
# 连接到 MySQL (首次使用无密码)
mysql -u root

# 在 MySQL 命令行中执行以下命令:
CREATE DATABASE sm_signature_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'sm_user'@'localhost' IDENTIFIED BY 'sm_password_123';

GRANT ALL PRIVILEGES ON sm_signature_system.* TO 'sm_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

### 3.3 验证数据库连接

```bash
# 使用新创建的用户连接
mysql -u sm_user -p sm_signature_system

# 输入密码: sm_password_123

# 在 MySQL 中执行:
SELECT 1;

EXIT;
```

---

## ⚙️ 第四步：环境变量配置

### 4.1 创建 .env 文件

```bash
# 复制示例文件
cp .env.example .env
```

### 4.2 编辑 .env 文件

使用文本编辑器打开 `.env`，配置以下内容：

```env
# 数据库配置
DATABASE_URL="mysql://sm_user:sm_password_123@localhost:3306/sm_signature_system"

# JWT 密钥 (用于会话加密，生成随机字符串)
JWT_SECRET="your-random-secret-key-here-min-32-chars-long-1234567890"

# OAuth 配置 (如果使用 Manus OAuth，从平台获取)
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"

# 应用配置
VITE_APP_TITLE="国密 SM2/SM3 数字签名系统"
VITE_APP_LOGO="🛡️"

# 开发环境
NODE_ENV="development"
```

**重要**：
- 将 `JWT_SECRET` 替换为随机的 32+ 字符字符串
- 如果不使用 OAuth，可以暂时保留默认值

---

## 🔧 第五步：GmSSL 库配置

### 5.1 安装 gmssl-python

```bash
# 使用 pip 安装
pip3 install gmssl

# 验证安装
python3 -c "import gmssl; print('✓ gmssl-python 已安装')"
```

### 5.2 测试 GmSSL 功能

```bash
# 测试 SM3 哈希
python3 << 'EOF'
from gmssl import sm3

# 计算 SM3 哈希
msg = "hello world"
hash_result = sm3.sm3_hash(msg.encode())
print(f"SM3 哈希: {hash_result}")
EOF

# 预期输出: 一个 64 位十六进制字符串
```

### 5.3 测试 SM2 密钥生成

```bash
python3 << 'EOF'
from gmssl import sm2

# 生成 SM2 密钥对
private_key = sm2.generate_private_key()
public_key = sm2.get_public_key_from_private_key(private_key)

print(f"私钥: {private_key[:20]}...")
print(f"公钥: {public_key[:20]}...")
print("✓ SM2 密钥生成成功")
EOF
```

---

## 🗄️ 第六步：数据库迁移

### 6.1 生成迁移文件

```bash
# 进入项目目录
cd sm-signature-system

# 生成 Drizzle 迁移
pnpm drizzle-kit generate

# 输出应该显示:
# Reading schema files:
# /path/to/sm-signature-system/drizzle/schema.ts
# 5 tables
```

### 6.2 执行迁移

```bash
# 执行迁移
pnpm drizzle-kit migrate

# 或者手动执行 SQL
mysql -u sm_user -p sm_signature_system < drizzle/0001_far_meltdown.sql
```

### 6.3 验证表创建

```bash
# 连接到数据库
mysql -u sm_user -p sm_signature_system

# 在 MySQL 中执行:
SHOW TABLES;

# 应该看到:
# +----------------------------+
# | Tables_in_sm_signature_system |
# +----------------------------+
# | signatures                 |
# | sm2_keys                   |
# | sm3_hashes                 |
# | users                      |
# | verifications              |
# +----------------------------+

EXIT;
```

---

## 🚀 第七步：本地开发服务器

### 7.1 启动开发服务器

```bash
# 进入项目目录
cd sm-signature-system

# 启动开发服务器
pnpm dev

# 预期输出:
# ✓ [2026-05-03T18:01:51.629Z] Server running on http://localhost:3000/
```

### 7.2 访问应用

打开浏览器，访问：

```
http://localhost:3000
```

您应该看到：
- 🛡️ 国密 SM2/SM3 数字签名系统 标题
- 侧边栏导航菜单
- 仪表盘主区域
- 登录提示（如果配置了 OAuth）

---

## ✅ 第八步：功能测试

### 8.1 SM2 密钥生成测试

1. 点击左侧菜单中的"密钥生成"
2. 输入密钥名称（如："测试密钥"）
3. 点击"生成 SM2 密钥对"
4. 验证：
   - ✓ 公钥显示（128 字符十六进制）
   - ✓ 私钥显示（128 字符十六进制）
   - ✓ 可以下载密钥文件

### 8.2 SM3 哈希计算测试

1. 点击"SM3 哈希"
2. 输入文本（如："hello world"）
3. 点击"计算 SM3 哈希"
4. 验证：
   - ✓ 哈希值显示（64 字符十六进制）
   - ✓ 可以上传文件计算哈希
   - ✓ 历史记录保存

### 8.3 数字签名测试

1. 点击"数字签名"
2. 选择之前生成的密钥
3. 输入消息（如："test message"）
4. 点击"对消息进行 SM2 签名"
5. 验证：
   - ✓ 签名值显示
   - ✓ 可以复制签名
   - ✓ 操作记录保存

### 8.4 签名验证测试

1. 点击"签名验证"
2. 粘贴原始消息
3. 粘贴签名值
4. 粘贴公钥
5. 点击"验证 SM2 签名"
6. 验证：
   - ✓ 显示"✓ 通过"或"✗ 失败"
   - ✓ 验证结果正确

### 8.5 操作历史测试

1. 点击"操作历史"
2. 查看各个标签页：
   - ✓ SM3 哈希历史
   - ✓ 数字签名历史
   - ✓ 签名验证历史
3. 验证：
   - ✓ 所有操作都被记录
   - ✓ 时间戳正确
   - ✓ 数据完整

---

## 🐛 第九步：本地调试

### 9.1 查看浏览器控制台

```
按 F12 打开开发者工具 → Console 标签页
```

检查是否有错误信息。常见错误：

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `Failed to fetch` | 后端 API 不可用 | 检查 `pnpm dev` 是否运行 |
| `Database connection error` | 数据库未连接 | 检查 MySQL 是否运行，.env 配置是否正确 |
| `gmssl module not found` | GmSSL 未安装 | 运行 `pip3 install gmssl` |
| `CORS error` | 跨域问题 | 检查后端 CORS 配置 |

### 9.2 查看后端日志

在 `pnpm dev` 运行的终端中查看日志：

```
[2026-05-03T18:01:51.629Z] Server running on http://localhost:3000/
[2026-05-03T18:01:52.123Z] [OAuth] Initialized
[2026-05-03T18:01:53.456Z] [Database] Connected
```

### 9.3 测试后端 API

```bash
# 测试 SM3 哈希 API
curl -X POST http://localhost:3000/api/trpc/crypto.calculateSm3Text \
  -H "Content-Type: application/json" \
  -d '{"text":"hello world"}'

# 预期响应:
# {"result":{"data":{"hash":"66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0"}}}
```

---

## 📦 第十步：生产构建

### 10.1 构建应用

```bash
# 构建前端和后端
pnpm build

# 预期输出:
# ✓ built in 4.30s
# dist/index.js  47.7kb
# ⚡ Done in 6ms
```

### 10.2 验证构建产物

```bash
# 检查构建文件
ls -lh dist/

# 应该看到:
# -rw-r--r-- 1 user group 47.7K May  3 14:00 index.js
# drwxr-xr-x 2 user group 4.0K May  3 14:00 public/
```

### 10.3 本地测试生产构建

```bash
# 启动生产服务器
pnpm start

# 访问
http://localhost:3000

# 验证应用正常运行
```

---

## 🎯 第十一步：准备部署到香橙派

### 11.1 检查清单

在部署到香橙派之前，确保以下所有项都已完成：

- [ ] 本地环境已完全配置
- [ ] 所有依赖已安装
- [ ] 数据库已创建并迁移
- [ ] GmSSL 库已安装并测试
- [ ] 所有功能都已在本地测试通过
- [ ] 生产构建成功
- [ ] .env 文件已配置
- [ ] 没有 TypeScript 错误
- [ ] 没有运行时错误

### 11.2 生成部署包

```bash
# 创建部署包
zip -r sm-signature-system-deploy.zip . \
  -x "node_modules/*" \
  "dist/*" \
  ".git/*" \
  "*.log"

# 验证包大小
ls -lh sm-signature-system-deploy.zip
```

### 11.3 准备香橙派

在香橙派上执行以下命令：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y build-essential cmake git curl wget \
  python3 python3-pip python3-dev nodejs npm mysql-server

# 安装 pnpm
sudo npm install -g pnpm

# 安装 GmSSL
pip3 install gmssl
```

---

## 🚀 第十二步：部署到香橙派

### 12.1 上传项目文件

```bash
# 在本地执行
scp -r sm-signature-system-deploy.zip orangepi@192.168.1.XXX:/home/orangepi/

# 在香橙派上解压
ssh orangepi@192.168.1.XXX
cd /home/orangepi
unzip sm-signature-system-deploy.zip
cd sm-signature-system
```

### 12.2 配置香橙派环境

```bash
# 在香橙派上执行
pnpm install
cp .env.example .env

# 编辑 .env 文件
nano .env

# 配置数据库 URL 为香橙派本地地址
# DATABASE_URL="mysql://sm_user:sm_password_123@localhost:3306/sm_signature_system"
```

### 12.3 初始化香橙派数据库

```bash
# 在香橙派上执行
pnpm drizzle-kit migrate

# 或手动执行
mysql -u sm_user -p sm_signature_system < drizzle/0001_far_meltdown.sql
```

### 12.4 启动香橙派服务

```bash
# 构建应用
pnpm build

# 启动服务
pnpm start

# 或使用 Systemd (参考 DEPLOYMENT_GUIDE.md)
sudo systemctl start sm-signature.service
```

---

## ✅ 完整检查清单

| 步骤 | 任务 | 状态 |
|------|------|------|
| 1 | 安装 Node.js、npm、Python、Git | ☐ |
| 2 | 安装 pnpm | ☐ |
| 3 | 解压项目并安装依赖 | ☐ |
| 4 | 安装并配置 MySQL | ☐ |
| 5 | 创建数据库和用户 | ☐ |
| 6 | 配置 .env 文件 | ☐ |
| 7 | 安装 gmssl-python | ☐ |
| 8 | 测试 GmSSL 功能 | ☐ |
| 9 | 执行数据库迁移 | ☐ |
| 10 | 启动本地开发服务器 | ☐ |
| 11 | 测试 SM2 密钥生成 | ☐ |
| 12 | 测试 SM3 哈希计算 | ☐ |
| 13 | 测试数字签名 | ☐ |
| 14 | 测试签名验证 | ☐ |
| 15 | 测试操作历史 | ☐ |
| 16 | 生产构建 | ☐ |
| 17 | 测试生产构建 | ☐ |
| 18 | 准备香橙派环境 | ☐ |
| 19 | 部署到香橙派 | ☐ |
| 20 | 在香橙派上验证功能 | ☐ |

---

## 📞 故障排查

### 问题 1: npm install 失败

**症状**：`npm ERR! code ERESOLVE`

**解决方案**：

```bash
# 使用 pnpm 替代
pnpm install

# 或者使用 npm 的强制模式
npm install --legacy-peer-deps
```

### 问题 2: 数据库连接失败

**症状**：`Error: connect ECONNREFUSED 127.0.0.1:3306`

**排查步骤**：

```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 启动 MySQL
sudo systemctl start mysql

# 检查连接
mysql -u sm_user -p -h localhost

# 检查 .env 中的 DATABASE_URL
cat .env | grep DATABASE_URL
```

### 问题 3: GmSSL 导入失败

**症状**：`ModuleNotFoundError: No module named 'gmssl'`

**解决方案**：

```bash
# 重新安装 gmssl
pip3 install --upgrade gmssl

# 验证安装
python3 -c "import gmssl; print(gmssl.__version__)"
```

### 问题 4: 端口 3000 已被占用

**症状**：`Error: listen EADDRINUSE :::3000`

**解决方案**：

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用不同的端口
PORT=3001 pnpm dev
```

### 问题 5: TypeScript 编译错误

**症状**：`error TS2304: Cannot find name 'xxx'`

**解决方案**：

```bash
# 清除缓存并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 检查 TypeScript 版本
pnpm list typescript
```

---

## 📚 参考资源

- [Node.js 官网](https://nodejs.org/)
- [MySQL 官网](https://www.mysql.com/)
- [GmSSL 官网](https://github.com/guanzhi/GmSSL)
- [gmssl-python 文档](https://github.com/GmSSL/GmSSL-Python)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [tRPC 文档](https://trpc.io/)

---

**最后更新**：2026年5月3日  
**版本**：1.0
