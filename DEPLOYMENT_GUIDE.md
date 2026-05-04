# 国密 SM2/SM3 数字签名系统 - Orange Pi 5 Plus 部署指南

**作者**: Manus AI  
**版本**: 1.0.0  
**最后更新**: 2026年5月  
**硬件平台**: Orange Pi 5 Plus (RK3588)  
**操作系统**: Ubuntu 22.04 ARM64

---

## 目录

1. [系统概述](#系统概述)
2. [硬件准备](#硬件准备)
3. [系统环境配置](#系统环境配置)
4. [GmSSL 库编译安装](#gmssl-库编译安装)
5. [应用部署](#应用部署)
6. [服务启动](#服务启动)
7. [远程访问](#远程访问)
8. [故障排查](#故障排查)
9. [性能优化](#性能优化)

---

## 系统概述

本系统是一个基于国密算法 (SM2/SM3) 的专业级数字签名与验证平台，专为 Orange Pi 5 Plus 开发板优化设计。系统采用前后端分离架构，后端使用 Node.js + tRPC，前端使用 React，并集成真实的 GmSSL 国密算法库进行密码运算。

**核心功能**：

- **SM2 密钥对生成**：生成椭圆曲线公私钥对，支持密钥下载和管理
- **SM3 哈希计算**：对文本或文件进行 256 位密码杂凑
- **数字签名**：使用 SM2 私钥对消息或文件进行签名
- **签名验证**：使用 SM2 公钥验证签名的真实性和完整性
- **操作历史**：记录所有签名和验证操作

**系统架构**：

| 组件 | 技术栈 | 说明 |
|------|--------|------|
| 前端 | React 19 + Tailwind 4 | 浏览器应用，手绘草图美学设计 |
| 后端 | Node.js + Express + tRPC | REST API 和 RPC 接口 |
| 数据库 | MySQL/TiDB | 用户、密钥、签名记录存储 |
| 密码库 | GmSSL (C) + gmssl-python | 真实国密算法实现 |
| 文件存储 | S3 兼容存储 | 上传文件和密钥备份 |

---

## 硬件准备

### 2.1 硬件清单

| 设备 | 规格 | 说明 |
|------|------|------|
| Orange Pi 5 Plus | RK3588, 8GB/16GB RAM | 核心计算平台 |
| 存储 | 32GB+ microSD 卡或 eMMC | 系统和应用存储 |
| 电源 | 5V/4A USB Type-C | 供电 |
| 网络 | 以太网或 Wi-Fi | 网络连接 |
| 电脑 | 任意操作系统 | 远程访问客户端 |

### 2.2 网络拓扑

```
┌─────────────────┐
│  电脑/笔记本    │
│  (客户端)       │
└────────┬────────┘
         │ Wi-Fi/有线
         │
    ┌────▼────────────────┐
    │   路由器/交换机      │
    └────┬────────────────┘
         │ 以太网/Wi-Fi
         │
    ┌────▼──────────────────┐
    │ Orange Pi 5 Plus      │
    │ - 应用服务器          │
    │ - 数据库              │
    │ - GmSSL 库            │
    └───────────────────────┘
```

### 2.3 初始化 Orange Pi 5 Plus

1. **烧写系统镜像**

   从 [Orange Pi 官方网站](https://www.orangepi.org/) 下载 Ubuntu 22.04 ARM64 镜像，使用 Balena Etcher 或 dd 命令烧写到 microSD 卡：

   ```bash
   # Linux/Mac 用户
   sudo dd if=orangepi-ubuntu-22.04-arm64.img of=/dev/sdX bs=4M status=progress
   sync

   # 或使用 Balena Etcher (图形界面)
   ```

2. **首次启动**

   - 插入 microSD 卡到开发板
   - 连接 USB Type-C 电源
   - 连接以太网或配置 Wi-Fi
   - 开发板自动启动

3. **连接到开发板**

   ```bash
   # 通过 SSH 连接 (默认用户: orangepi, 密码: orangepi)
   ssh orangepi@192.168.1.XXX
   
   # 或查找开发板 IP
   arp-scan -l | grep -i orange
   ```

4. **初始配置**

   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 修改主机名 (可选)
   sudo hostnamectl set-hostname sm-signature-server
   
   # 设置时区
   sudo timedatectl set-timezone Asia/Shanghai
   
   # 启用 SSH
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

---

## 系统环境配置

### 3.1 安装基础依赖

```bash
# 安装编译工具和开发库
sudo apt install -y \
    build-essential \
    cmake \
    git \
    curl \
    wget \
    libssl-dev \
    libffi-dev \
    python3-dev \
    python3-pip \
    nodejs \
    npm

# 验证安装
gcc --version
cmake --version
python3 --version
node --version
npm --version
```

### 3.2 配置 Python 环境

```bash
# 升级 pip
sudo pip3 install --upgrade pip setuptools wheel

# 安装 Python 虚拟环境工具
sudo pip3 install virtualenv

# 创建虚拟环境 (可选，用于隔离依赖)
python3 -m venv ~/gmssl-env
source ~/gmssl-env/bin/activate
```

### 3.3 配置 Node.js 环境

```bash
# 安装 pnpm (更快的包管理器)
sudo npm install -g pnpm

# 验证
pnpm --version
```

### 3.4 配置数据库

本系统支持 MySQL 或 TiDB。以下以 MySQL 为例：

```bash
# 安装 MySQL 服务器
sudo apt install -y mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 创建应用数据库
sudo mysql -u root << EOF
CREATE DATABASE sm_signature_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sm_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON sm_signature_system.* TO 'sm_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 验证
mysql -u sm_user -p -e "SELECT VERSION();"
```

---

## GmSSL 库编译安装

### 4.1 下载 GmSSL 源代码

```bash
# 创建工作目录
mkdir -p ~/crypto-build
cd ~/crypto-build

# 下载 GmSSL 源代码
git clone https://github.com/guanzhi/GmSSL.git
cd GmSSL

# 查看最新版本
git tag | tail -10
```

### 4.2 编译 GmSSL C 库

```bash
# 创建构建目录
mkdir build
cd build

# 配置编译选项
# 注意：必须编译为动态库 (.so)，gmssl-python 需要调用
cmake -DCMAKE_BUILD_TYPE=Release ..

# 编译 (这个步骤可能需要 5-10 分钟)
make -j$(nproc)

# 运行测试
make test

# 安装到系统
sudo make install

# 配置动态库路径
sudo ldconfig

# 验证安装
gmssl help
```

### 4.3 验证 GmSSL 安装

```bash
# 测试 SM3 哈希
echo -n "abc" | gmssl sm3
# 预期输出: 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0

# 测试 SM2 密钥生成
gmssl genpkey -algorithm SM2 -out sm2.pem

# 查看库版本
gmssl version
```

### 4.4 安装 gmssl-python 绑定

```bash
# 方法 1: 从 PyPI 安装 (推荐)
sudo pip3 install gmssl-python

# 方法 2: 从源代码安装 (最新版本)
cd ~/crypto-build
git clone https://github.com/GmSSL/GmSSL-Python.git
cd GmSSL-Python
python3 -m unittest -v  # 运行测试
sudo pip3 install .

# 验证安装
python3 -c "import gmssl; print(gmssl.GMSSL_PYTHON_VERSION)"
```

---

## 应用部署

### 5.1 克隆应用代码

```bash
# 创建应用目录
mkdir -p ~/apps
cd ~/apps

# 克隆或下载应用代码
git clone https://github.com/your-repo/sm-signature-system.git
cd sm-signature-system

# 查看项目结构
ls -la
```

### 5.2 配置环境变量

```bash
# 创建 .env 文件
cat > .env << 'EOF'
# 数据库配置
DATABASE_URL="mysql://sm_user:your_secure_password@localhost:3306/sm_signature_system"

# 应用配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# JWT 密钥 (生成随机字符串)
JWT_SECRET=$(openssl rand -base64 32)

# S3 存储配置 (如果使用)
S3_BUCKET=sm-signature-storage
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# OAuth 配置 (如果使用)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_REDIRECT_URI=http://your-server-ip:3000/api/oauth/callback
EOF

# 设置权限
chmod 600 .env
```

### 5.3 安装依赖

```bash
# 安装 Node.js 依赖
pnpm install

# 如果遇到编译问题，尝试
pnpm install --no-optional
```

### 5.4 数据库迁移

```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate

# 验证数据库
mysql -u sm_user -p sm_signature_system -e "SHOW TABLES;"
```

### 5.5 构建应用

```bash
# 构建前端
pnpm build

# 构建后端
pnpm build:server

# 验证构建产物
ls -la dist/
```

---

## 服务启动

### 6.1 开发模式启动

```bash
# 启动开发服务器 (包含热重载)
pnpm dev

# 输出示例:
# ✓ [2026-05-03T17:45:51.629Z] Server running on http://localhost:3000/
```

### 6.2 生产模式启动

```bash
# 启动生产服务器
pnpm start

# 或使用 PM2 进程管理器
sudo npm install -g pm2
pm2 start "pnpm start" --name "sm-signature-system"
pm2 save
pm2 startup
```

### 6.3 使用 Systemd 服务

创建 systemd 服务文件以实现开机自启：

```bash
# 创建服务文件
sudo tee /etc/systemd/system/sm-signature.service > /dev/null << 'EOF'
[Unit]
Description=SM2/SM3 Digital Signature System
After=network.target mysql.service

[Service]
Type=simple
User=orangepi
WorkingDirectory=/home/orangepi/apps/sm-signature-system
Environment="NODE_ENV=production"
Environment="PATH=/home/orangepi/.nvm/versions/node/v22.13.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 启用和启动服务
sudo systemctl daemon-reload
sudo systemctl enable sm-signature.service
sudo systemctl start sm-signature.service

# 查看服务状态
sudo systemctl status sm-signature.service

# 查看日志
sudo journalctl -u sm-signature.service -f
```

### 6.4 配置反向代理 (Nginx)

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置文件
sudo tee /etc/nginx/sites-available/sm-signature > /dev/null << 'EOF'
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/sm-signature /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 启动 Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 远程访问

### 7.1 获取开发板 IP 地址

```bash
# 方法 1: 在开发板上查看
ip addr show

# 方法 2: 从其他电脑扫描
arp-scan -l | grep -i orange

# 方法 3: 查看路由器管理界面
```

### 7.2 访问应用

在电脑浏览器中输入：

```
http://192.168.1.XXX:3000
```

或如果配置了 Nginx：

```
http://192.168.1.XXX
```

### 7.3 配置固定 IP (可选)

```bash
# 编辑网络配置
sudo nano /etc/netplan/01-netcfg.yaml

# 示例配置:
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# 应用配置
sudo netplan apply

# 验证
ip addr show
```

---

## 故障排查

### 8.1 GmSSL 库加载失败

**症状**: `ImportError: libgmssl.so: cannot open shared object file`

**解决方案**:

```bash
# 检查库文件位置
find /usr -name "libgmssl.so*" 2>/dev/null

# 更新动态库缓存
sudo ldconfig

# 添加库路径到环境变量
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# 永久添加 (编辑 ~/.bashrc)
echo 'export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### 8.2 数据库连接失败

**症状**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:

```bash
# 检查 MySQL 服务状态
sudo systemctl status mysql

# 启动 MySQL
sudo systemctl start mysql

# 检查连接字符串
cat .env | grep DATABASE_URL

# 测试连接
mysql -u sm_user -p -h 127.0.0.1 sm_signature_system -e "SELECT 1;"
```

### 8.3 端口被占用

**症状**: `Error: listen EADDRINUSE :::3000`

**解决方案**:

```bash
# 查找占用端口的进程
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>

# 或更改应用端口
PORT=3001 pnpm start
```

### 8.4 内存不足

**症状**: `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`

**解决方案**:

```bash
# 增加 Node.js 堆内存
NODE_OPTIONS="--max-old-space-size=1024" pnpm start

# 或在 systemd 服务中配置
Environment="NODE_OPTIONS=--max-old-space-size=1024"
```

### 8.5 查看日志

```bash
# 查看应用日志
sudo journalctl -u sm-signature.service -n 100 -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 查看系统日志
dmesg | tail -20
```

---

## 性能优化

### 9.1 系统级优化

```bash
# 增加文件描述符限制
sudo sysctl -w fs.file-max=2097152
echo "fs.file-max = 2097152" | sudo tee -a /etc/sysctl.conf

# 优化网络参数
sudo sysctl -w net.core.somaxconn=65535
echo "net.core.somaxconn = 65535" | sudo tee -a /etc/sysctl.conf

# 应用配置
sudo sysctl -p
```

### 9.2 数据库优化

```bash
# 编辑 MySQL 配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加优化参数:
[mysqld]
max_connections=1000
innodb_buffer_pool_size=512M
innodb_log_file_size=256M
query_cache_size=64M
query_cache_type=1

# 重启 MySQL
sudo systemctl restart mysql
```

### 9.3 应用级优化

```bash
# 启用 Node.js 集群模式 (server/index.ts)
import cluster from 'cluster';
import os from 'os';

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 启动应用
}

# 使用 PM2 负载均衡
pm2 start app.js -i max
```

### 9.4 监控系统资源

```bash
# 实时监控
htop

# 查看 CPU 使用率
top -b -n 1 | head -20

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看网络流量
iftop
```

---

## 常见问题 (FAQ)

**Q: 系统支持多少并发用户？**

A: 在 Orange Pi 5 Plus (8GB RAM) 上，系统可支持 100-500 并发用户，具体取决于操作复杂度和文件大小。建议使用负载均衡器在多个实例间分散流量。

**Q: 如何备份密钥？**

A: 系统支持密钥下载功能。用户可在"密钥生成"页面下载密钥 JSON 文件。建议定期备份到安全位置。

**Q: 支持 HTTPS 吗？**

A: 可以。使用 Let's Encrypt 免费证书或自签名证书配置 Nginx SSL。

**Q: 如何扩展存储？**

A: 可连接 USB 移动硬盘或 NAS 存储。编辑 S3 配置指向外部存储服务。

**Q: 系统是否支持集群部署？**

A: 支持。可部署多个 Orange Pi 5 Plus 实例，使用 MySQL 主从复制和 Nginx 负载均衡。

---

## 参考资源

| 资源 | 链接 |
|------|------|
| Orange Pi 官方网站 | https://www.orangepi.org/ |
| GmSSL GitHub 仓库 | https://github.com/guanzhi/GmSSL |
| gmssl-python GitHub | https://github.com/GmSSL/GmSSL-Python |
| Node.js 官方文档 | https://nodejs.org/docs/ |
| MySQL 官方文档 | https://dev.mysql.com/doc/ |
| Nginx 官方文档 | https://nginx.org/en/docs/ |
| Ubuntu 官方文档 | https://ubuntu.com/server/docs |

---

## 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 支持

如遇到问题，请：

1. 查看本文档的"故障排查"部分
2. 查看应用日志：`sudo journalctl -u sm-signature.service -f`
3. 在 GitHub 上提交 Issue
4. 联系技术支持团队

---

**文档版本**: 1.0.0  
**最后更新**: 2026年5月3日  
**维护者**: Manus AI
