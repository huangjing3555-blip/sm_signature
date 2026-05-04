# 🚀 本地快速配置 (5 分钟版)

如果您想快速在本地运行项目，按照以下步骤操作：

## 第 1 步：安装基础工具 (2 分钟)

### Windows
```powershell
choco install nodejs git python3 mysql
```

### macOS
```bash
brew install node git python3 mysql
brew services start mysql
```

### Linux (Ubuntu)
```bash
sudo apt install -y nodejs npm git python3 python3-pip mysql-server
sudo systemctl start mysql
```

## 第 2 步：项目初始化 (1 分钟)

```bash
# 解压并进入项目
unzip sm-signature-system-complete.zip
cd sm-signature-system

# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install
```

## 第 3 步：数据库配置 (1 分钟)

```bash
# 创建数据库
mysql -u root -e "
CREATE DATABASE sm_signature_system CHARACTER SET utf8mb4;
CREATE USER 'sm_user'@'localhost' IDENTIFIED BY 'sm_password_123';
GRANT ALL PRIVILEGES ON sm_signature_system.* TO 'sm_user'@'localhost';
FLUSH PRIVILEGES;
"

# 迁移数据库
pnpm drizzle-kit migrate
```

## 第 4 步：安装 GmSSL (1 分钟)

```bash
pip3 install gmssl

# 验证
python3 -c "import gmssl; print('✓ GmSSL 已安装')"
```

## 第 5 步：配置环境变量 (1 分钟)

```bash
# 复制配置文件
cp .env.example .env

# 编辑 .env (修改 JWT_SECRET 为随机字符串)
# 数据库 URL: mysql://sm_user:sm_password_123@localhost:3306/sm_signature_system
```

## 第 6 步：启动开发服务器

```bash
pnpm dev

# 访问 http://localhost:3000
```

---

## ✅ 快速验证清单

- [ ] Node.js 已安装 (`node --version`)
- [ ] npm 已安装 (`npm --version`)
- [ ] Python3 已安装 (`python3 --version`)
- [ ] MySQL 已安装并运行 (`mysql -u root -e "SELECT 1"`)
- [ ] pnpm 已安装 (`pnpm --version`)
- [ ] 项目依赖已安装 (`pnpm list | head -5`)
- [ ] 数据库已创建 (`mysql -u sm_user -p sm_signature_system -e "SHOW TABLES"`)
- [ ] GmSSL 已安装 (`python3 -c "import gmssl"`)
- [ ] 开发服务器已启动 (`http://localhost:3000`)

---

## 🎯 测试功能

1. **SM2 密钥生成** → 点击"密钥生成" → 输入名称 → 点击"生成"
2. **SM3 哈希** → 点击"SM3 哈希" → 输入文本 → 点击"计算"
3. **数字签名** → 点击"数字签名" → 选择密钥 → 输入消息 → 点击"签名"
4. **签名验证** → 点击"签名验证" → 粘贴消息、签名、公钥 → 点击"验证"
5. **操作历史** → 点击"操作历史" → 查看所有记录

---

## 🐛 常见问题

| 问题 | 解决方案 |
|------|---------|
| `npm ERR! code ERESOLVE` | 使用 `pnpm install` 替代 |
| `ECONNREFUSED 127.0.0.1:3306` | 启动 MySQL: `sudo systemctl start mysql` |
| `ModuleNotFoundError: gmssl` | 运行 `pip3 install gmssl` |
| `EADDRINUSE :::3000` | 端口被占用，运行 `PORT=3001 pnpm dev` |

---

## 📚 详细指南

如需更详细的配置说明，请参考 `LOCAL_SETUP_GUIDE.md`

---

## 🚀 部署到香橙派

本地验证完成后，按照 `DEPLOYMENT_GUIDE.md` 部署到香橙派 5 Plus。

**预计部署时间**：30-45 分钟
