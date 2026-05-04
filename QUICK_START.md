# 快速开始指南

本指南提供了在 Orange Pi 5 Plus 上快速部署国密 SM2/SM3 数字签名系统的步骤。

## 📋 前置条件

- Orange Pi 5 Plus 开发板
- Ubuntu 22.04 ARM64 系统
- SSH 连接或直接连接到开发板
- 网络连接正常

## 🚀 5 分钟快速部署

### 第 1 步：连接到开发板

```bash
# 通过 SSH 连接 (替换 IP 地址)
ssh orangepi@192.168.1.XXX

# 或者直接在开发板上操作
```

### 第 2 步：更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 第 3 步：安装基础依赖

```bash
sudo apt install -y \
    build-essential cmake git curl wget \
    libssl-dev libffi-dev python3-dev python3-pip \
    nodejs npm mysql-server
```

### 第 4 步：安装 GmSSL 库

```bash
# 克隆 GmSSL 源代码
mkdir -p ~/crypto-build && cd ~/crypto-build
git clone https://github.com/guanzhi/GmSSL.git
cd GmSSL

# 编译和安装
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc)
sudo make install
sudo ldconfig

# 验证安装
gmssl help
```

### 第 5 步：安装 gmssl-python

```bash
# 安装 Python 绑定
sudo pip3 install gmssl-python

# 验证
python3 -c "import gmssl; print('gmssl-python 安装成功')"
```

### 第 6 步：克隆应用代码

```bash
# 创建应用目录
mkdir -p ~/apps && cd ~/apps

# 克隆代码 (替换为实际仓库地址)
git clone https://github.com/your-repo/sm-signature-system.git
cd sm-signature-system
```

### 第 7 步：配置数据库

```bash
# 启动 MySQL
sudo systemctl start mysql

# 创建数据库和用户
sudo mysql -u root << 'SQL'
CREATE DATABASE sm_signature_system CHARACTER SET utf8mb4;
CREATE USER 'sm_user'@'localhost' IDENTIFIED BY 'sm_password_123';
GRANT ALL PRIVILEGES ON sm_signature_system.* TO 'sm_user'@'localhost';
FLUSH PRIVILEGES;
SQL

# 验证
mysql -u sm_user -p sm_signature_system -e "SELECT 1;"
```

### 第 8 步：配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置文件
nano .env

# 修改以下内容:
# DATABASE_URL="mysql://sm_user:sm_password_123@localhost:3306/sm_signature_system"
# JWT_SECRET="your-random-secret-here"
```

### 第 9 步：安装依赖和部署

```bash
# 安装 pnpm
sudo npm install -g pnpm

# 安装项目依赖
pnpm install

# 数据库迁移
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 构建应用
pnpm build
pnpm build:server
```

### 第 10 步：启动应用

```bash
# 开发模式 (用于测试)
pnpm dev

# 或生产模式
pnpm start

# 输出应该显示:
# ✓ Server running on http://localhost:3000/
```

### 第 11 步：访问应用

在电脑浏览器中打开：

```
http://192.168.1.XXX:3000
```

## ✅ 验证部署

### 检查服务状态

```bash
# 检查应用是否运行
curl http://localhost:3000/

# 检查数据库连接
mysql -u sm_user -p sm_signature_system -e "SELECT COUNT(*) FROM users;"
```

### 测试密码学功能

1. 在浏览器中登录系统
2. 进入"密钥生成"页面
3. 创建一个测试密钥
4. 进入"SM3 哈希"页面，输入文本并计算哈希
5. 验证功能正常工作

## 🔧 配置反向代理 (可选)

### 使用 Nginx

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置
sudo tee /etc/nginx/sites-available/sm-signature > /dev/null << 'NGINX'
upstream app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 100M;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# 启用配置
sudo ln -s /etc/nginx/sites-available/sm-signature /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试和启动
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx
```

现在可以直接访问：`http://192.168.1.XXX`

## 🔄 开机自启配置

### 使用 Systemd

```bash
# 创建服务文件
sudo tee /etc/systemd/system/sm-signature.service > /dev/null << 'SERVICE'
[Unit]
Description=SM2/SM3 Digital Signature System
After=network.target mysql.service

[Service]
Type=simple
User=orangepi
WorkingDirectory=/home/orangepi/apps/sm-signature-system
Environment="NODE_ENV=production"
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

# 启用和启动
sudo systemctl daemon-reload
sudo systemctl enable sm-signature.service
sudo systemctl start sm-signature.service

# 查看状态
sudo systemctl status sm-signature.service
```

## 🐛 常见问题

### 问题 1: GmSSL 库找不到

```bash
# 解决方案
sudo ldconfig
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
```

### 问题 2: 数据库连接失败

```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 检查连接字符串
cat .env | grep DATABASE_URL

# 测试连接
mysql -u sm_user -p sm_signature_system -e "SELECT 1;"
```

### 问题 3: 端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i :3000

# 更改端口
PORT=3001 pnpm start
```

### 问题 4: 内存不足

```bash
# 增加堆内存
NODE_OPTIONS="--max-old-space-size=1024" pnpm start
```

## 📖 后续步骤

1. **阅读完整文档**：查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **配置 HTTPS**：使用 Let's Encrypt 免费证书
3. **设置备份**：定期备份数据库和密钥
4. **性能优化**：根据实际使用情况调整配置
5. **安全加固**：配置防火墙和访问控制

## 📞 获取帮助

- 查看 [README.md](./README.md)
- 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 提交 Issue 到 GitHub

---

**祝您使用愉快！** 🎉
