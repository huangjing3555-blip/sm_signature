# 🚀 方案 A 完整部署指南：本地和香橙派都用 SQLite

您选择了方案 A，这是最简单直接的方案！本地和香橙派使用完全相同的 SQLite 数据库配置。

---

## 📋 方案 A 的优势

```
✅ 配置完全一致 - 无需维护两套代码
✅ 部署最简单 - 直接复制文件即可
✅ 开发快速 - 无需安装 MySQL
✅ 易于理解 - 一套配置走天下
✅ 完美匹配 - 本地和香橙派完全相同
```

---

## 🎯 部署流程概览

```
第 1 步：本地验证（5 分钟）
    ↓
第 2 步：生产构建（5 分钟）
    ↓
第 3 步：打包项目（2 分钟）
    ↓
第 4 步：上传到香橙派（5 分钟）
    ↓
第 5 步：香橙派配置（10 分钟）
    ↓
第 6 步：启动服务（5 分钟）
    ↓
第 7 步：验证功能（10 分钟）
    ↓
✅ 完成！总耗时：40 分钟
```

---

## 📝 第 1 步：本地验证（5 分钟）

### 1.1 检查本地配置

在 **VSCode 终端** 中执行：

```bash
# 打开 VSCode 终端：Ctrl + `

# 检查当前配置
cat .env | grep DATABASE_URL

# 预期输出：
# DATABASE_URL=file:./sm_signature.db
```

### 1.2 验证所有功能

在浏览器中访问 `http://localhost:3000`，测试：

- [ ] SM2 密钥生成 - 生成一个密钥
- [ ] SM3 哈希 - 计算一个哈希值
- [ ] 数字签名 - 签名一条消息
- [ ] 签名验证 - 验证签名
- [ ] 操作历史 - 查看所有操作记录

### 1.3 检查数据库

在 **VSCode 终端** 中执行：

```bash
# 查看数据库文件大小
ls -lh sm_signature.db

# 预期输出：
# -rw-r--r-- 1 user group 256K May  3 14:00 sm_signature.db
```

✅ **本地验证完成！**

---

## 📦 第 2 步：生产构建（5 分钟）

### 2.1 清理旧构建

在 **VSCode 终端** 中执行：

```bash
# 删除旧的构建文件
rm -rf dist
```

### 2.2 执行生产构建

在 **VSCode 终端** 中执行：

```bash
pnpm build

# 预期输出：
# ✓ built in 4.30s
# dist/index.js  47.7kb
```

### 2.3 验证构建产物

在 **VSCode 终端** 中执行：

```bash
# 检查构建文件
ls -lh dist/

# 预期输出：
# -rw-r--r-- 1 user group 47.7K May  3 14:00 index.js
# drwxr-xr-x 2 user group 4.0K May  3 14:00 public/
```

✅ **生产构建完成！**

---

## 📦 第 3 步：打包项目（2 分钟）

### 3.1 在 VSCode 终端中打包

```bash
# 创建部署包（排除不需要的文件）
zip -r sm-signature-system-deploy.zip . \
  -x "node_modules/*" \
  ".git/*" \
  "*.log" \
  ".manus-logs/*" \
  ".DS_Store" \
  "**/.DS_Store"

# 预期输出：
# adding: ... (很多文件)
# 完成后显示文件大小
```

### 3.2 验证打包

在 **VSCode 终端** 中执行：

```bash
# 检查 ZIP 文件大小
ls -lh sm-signature-system-deploy.zip

# 预期输出：
# -rw-rw-r-- 1 user group 279K May  3 14:00 sm-signature-system-deploy.zip
```

✅ **项目打包完成！**

---

## 🌐 第 4 步：上传到香橙派（5 分钟）

### 4.1 准备香橙派 IP 地址

您需要知道香橙派的 IP 地址。获取方式：

**在香橙派上执行**：
```bash
# 查看 IP 地址
hostname -I

# 预期输出：
# 192.168.1.100 (或其他 IP)
```

### 4.2 上传文件到香橙派

在 **系统终端**（不是 VSCode 终端）中执行：

**Windows 用户**：

```powershell
# 打开 PowerShell (Win + X → 选择 Windows PowerShell)

# 进入项目目录
cd C:\path\to\sm-signature-system

# 上传文件（替换 IP 地址）
scp sm-signature-system-deploy.zip orangepi@192.168.1.100:/home/orangepi/

# 输入密码：orangepi (或您设置的密码)
```

**Mac/Linux 用户**：

```bash
# 打开 Terminal

# 进入项目目录
cd /path/to/sm-signature-system

# 上传文件（替换 IP 地址）
scp sm-signature-system-deploy.zip orangepi@192.168.1.100:/home/orangepi/

# 输入密码：orangepi
```

### 4.3 验证上传

在 **系统终端** 中执行：

```bash
# 连接到香橙派
ssh orangepi@192.168.1.100

# 输入密码：orangepi

# 检查文件是否上传成功
ls -lh /home/orangepi/sm-signature-system-deploy.zip

# 预期输出：
# -rw-r--r-- 1 orangepi orangepi 279K May  3 14:00 sm-signature-system-deploy.zip
```

✅ **文件上传完成！**

---

## 🔧 第 5 步：香橙派配置（10 分钟）

### 5.1 解压项目文件

在 **系统终端**（已连接到香橙派）中执行：

```bash
# 进入 orangepi 用户的主目录
cd /home/orangepi

# 解压文件
unzip sm-signature-system-deploy.zip -d sm-signature-system

# 进入项目目录
cd sm-signature-system

# 列出文件验证
ls -la

# 预期输出：
# drwxr-xr-x  client/
# drwxr-xr-x  server/
# drwxr-xr-x  drizzle/
# -rw-r--r--  package.json
# -rw-r--r--  .env
# ... 其他文件
```

### 5.2 安装依赖

在 **系统终端**（香橙派）中执行：

```bash
# 安装 pnpm（如果还没安装）
sudo npm install -g pnpm

# 验证 pnpm
pnpm --version

# 进入项目目录
cd /home/orangepi/sm-signature-system

# 安装项目依赖
pnpm install

# 预期输出：
# added XXX packages, and audited XXX packages in Xs
# found 0 vulnerabilities
```

**⚠️ 注意**：这一步可能需要 5-10 分钟，请耐心等待。

### 5.3 生成数据库

在 **系统终端**（香橙派）中执行：

```bash
# 进入项目目录
cd /home/orangepi/sm-signature-system

# 生成数据库迁移
pnpm drizzle-kit generate

# 预期输出：
# Reading schema files:
# /home/orangepi/sm-signature-system/drizzle/schema.ts
# 5 tables
# No schema changes, nothing to migrate 😴
```

### 5.4 执行数据库迁移

在 **系统终端**（香橙派）中执行：

```bash
# 执行迁移
pnpm drizzle-kit migrate

# 预期输出：
# ✓ Migrations applied successfully
# ✓ Migrations applied successfully
```

### 5.5 验证数据库创建

在 **系统终端**（香橙派）中执行：

```bash
# 检查数据库文件
ls -lh sm_signature.db

# 预期输出：
# -rw-r--r-- 1 orangepi orangepi 256K May  3 14:00 sm_signature.db
```

✅ **香橙派配置完成！**

---

## 🚀 第 6 步：启动服务（5 分钟）

### 6.1 构建应用

在 **系统终端**（香橙派）中执行：

```bash
# 进入项目目录
cd /home/orangepi/sm-signature-system

# 构建应用
pnpm build

# 预期输出：
# ✓ built in 4.30s
# dist/index.js  47.7kb
```

### 6.2 启动服务

在 **系统终端**（香橙派）中执行：

```bash
# 启动服务
pnpm start

# 预期输出：
# [2026-05-03T14:00:00.000Z] Server running on http://localhost:3000/
# [2026-05-03T14:00:01.000Z] [OAuth] Initialized
# [2026-05-03T14:00:02.000Z] [Database] Connected
```

### 6.3 验证服务运行

打开另一个 **系统终端** 窗口，执行：

```bash
# 连接到香橙派
ssh orangepi@192.168.1.100

# 检查服务是否运行
curl http://localhost:3000

# 预期输出：
# <!DOCTYPE html>
# <html>
# ... HTML 内容
```

✅ **服务启动完成！**

---

## ✅ 第 7 步：验证功能（10 分钟）

### 7.1 在浏览器中访问应用

打开您的电脑浏览器，访问：

```
http://192.168.1.100:3000
```

（将 `192.168.1.100` 替换为您的香橙派 IP 地址）

### 7.2 测试所有功能

在浏览器中逐一测试：

#### ✅ 测试 1：SM2 密钥生成

1. 点击左侧菜单 "密钥生成"
2. 输入密钥名称（如："测试密钥"）
3. 点击 "生成 SM2 密钥对"
4. **验证**：
   - 公钥显示（128 字符）
   - 私钥显示（128 字符）
   - 可以下载文件

#### ✅ 测试 2：SM3 哈希计算

1. 点击左侧菜单 "SM3 哈希"
2. 输入文本（如："hello world"）
3. 点击 "计算 SM3 哈希"
4. **验证**：
   - 哈希值显示（64 字符十六进制）
   - 可以上传文件计算哈希

#### ✅ 测试 3：数字签名

1. 点击左侧菜单 "数字签名"
2. 选择之前生成的密钥
3. 输入消息（如："test message"）
4. 点击 "对消息进行 SM2 签名"
5. **验证**：
   - 签名值显示
   - 可以复制签名

#### ✅ 测试 4：签名验证

1. 点击左侧菜单 "签名验证"
2. 粘贴原始消息
3. 粘贴签名值
4. 粘贴公钥
5. 点击 "验证 SM2 签名"
6. **验证**：
   - 显示 "✓ 通过" 或 "✗ 失败"

#### ✅ 测试 5：操作历史

1. 点击左侧菜单 "操作历史"
2. 查看各个标签页
3. **验证**：
   - 所有操作都被记录
   - 时间戳正确
   - 数据完整

✅ **功能验证完成！**

---

## 🔄 设置开机自启（可选）

如果您希望香橙派重启后服务自动启动，执行以下步骤：

### 创建 Systemd 服务文件

在 **系统终端**（香橙派）中执行：

```bash
# 创建服务文件
sudo nano /etc/systemd/system/sm-signature.service
```

### 输入以下内容

```ini
[Unit]
Description=SM2/SM3 Digital Signature System
After=network.target

[Service]
Type=simple
User=orangepi
WorkingDirectory=/home/orangepi/sm-signature-system
ExecStart=/home/orangepi/.npm/_npx/*/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 保存并启用

```bash
# 按 Ctrl + X，然后按 Y，再按 Enter 保存

# 重新加载 systemd
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable sm-signature.service

# 启动服务
sudo systemctl start sm-signature.service

# 检查服务状态
sudo systemctl status sm-signature.service

# 预期输出：
# ● sm-signature.service - SM2/SM3 Digital Signature System
#    Loaded: loaded (/etc/systemd/system/sm-signature.service; enabled; vendor preset: enabled)
#    Active: active (running) since ...
```

---

## 📋 完整检查清单

在部署前，确保以下所有项都已完成：

### 本地准备
- [ ] 本地所有功能已测试通过
- [ ] 本地数据库已创建 (sm_signature.db)
- [ ] 生产构建成功 (`pnpm build`)
- [ ] 项目已打包成 ZIP 文件

### 香橙派部署
- [ ] 香橙派已连接网络
- [ ] 知道香橙派的 IP 地址
- [ ] 可以 SSH 连接到香橙派
- [ ] 文件已上传到香橙派
- [ ] 项目已解压
- [ ] 依赖已安装 (`pnpm install`)
- [ ] 数据库已迁移 (`pnpm drizzle-kit migrate`)
- [ ] 应用已构建 (`pnpm build`)
- [ ] 服务已启动 (`pnpm start`)

### 功能验证
- [ ] 可以访问 http://192.168.1.100:3000
- [ ] SM2 密钥生成正常
- [ ] SM3 哈希计算正常
- [ ] 数字签名功能正常
- [ ] 签名验证功能正常
- [ ] 操作历史记录正常

---

## 🐛 故障排查

### 问题 1：无法连接到香橙派

**症状**：`ssh: connect to host 192.168.1.100 port 22: Connection refused`

**解决方案**：

```bash
# 1. 检查 IP 地址是否正确
# 2. 确保香橙派已开机
# 3. 确保在同一网络
# 4. 检查防火墙设置

# 尝试 ping 香橙派
ping 192.168.1.100

# 如果无响应，检查 IP 地址
arp -a  # Windows
arp -n  # Mac/Linux
```

### 问题 2：pnpm install 失败

**症状**：`npm ERR! code ERESOLVE`

**解决方案**：

```bash
# 在香橙派上执行
cd /home/orangepi/sm-signature-system

# 使用 npm 的强制模式
npm install --legacy-peer-deps

# 或者清除缓存
pnpm store prune
pnpm install
```

### 问题 3：数据库迁移失败

**症状**：`Error: Failed to migrate`

**解决方案**：

```bash
# 在香橙派上执行
cd /home/orangepi/sm-signature-system

# 检查数据库文件
ls -lh sm_signature.db

# 如果文件不存在，手动创建
touch sm_signature.db

# 重新执行迁移
pnpm drizzle-kit migrate
```

### 问题 4：无法访问 http://192.168.1.100:3000

**症状**：`ERR_CONNECTION_REFUSED`

**解决方案**：

```bash
# 在香橙派上检查服务是否运行
ps aux | grep "pnpm start"

# 如果没有运行，启动服务
cd /home/orangepi/sm-signature-system
pnpm start

# 检查端口是否监听
netstat -tuln | grep 3000

# 预期输出：
# tcp  0  0 127.0.0.1:3000  0.0.0.0:*  LISTEN
```

### 问题 5：功能测试失败

**症状**：点击按钮无反应或显示错误

**解决方案**：

```bash
# 1. 打开浏览器开发者工具 (F12)
# 2. 查看 Console 标签页是否有错误
# 3. 查看 Network 标签页是否有失败的请求
# 4. 检查香橙派的日志

# 在香橙派上查看日志
tail -f /home/orangepi/sm-signature-system/pnpm-debug.log
```

---

## 📊 性能优化建议

### 1. 增加 Node.js 内存限制

```bash
# 在香橙派上
export NODE_OPTIONS="--max-old-space-size=512"
pnpm start
```

### 2. 使用 Nginx 反向代理（可选）

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/sm-signature

# 输入以下内容：
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/sm-signature /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📞 需要帮助？

如果遇到问题，请检查：

1. **本地配置** - 参考 `SETUP_SQLITE_VSCODE_PYCHARM.md`
2. **部署指南** - 参考 `DEPLOYMENT_GUIDE.md`
3. **故障排查** - 参考本文档的"故障排查"部分

---

## 🎉 恭喜！

您已经成功部署了国密 SM2/SM3 数字签名系统到香橙派！

**下一步建议**：
- 定期备份数据库文件 (`sm_signature.db`)
- 监控香橙派的磁盘空间
- 定期检查系统日志
- 考虑添加用户认证功能

---

**最后更新**：2026年5月3日  
**版本**：1.0  
**方案**：A（SQLite 本地 + SQLite 香橙派）
