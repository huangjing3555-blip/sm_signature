# 国密 SM2/SM3 数字签名与验签系统

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Orange%20Pi%205%20Plus-orange.svg)
![Node.js](https://img.shields.io/badge/node.js-v22.13.0-green.svg)

国密 SM2/SM3 数字签名与验签系统，是基于 Orange Pi 5 Plus 与 Node.js v22.13.0 开发的国密算法应用平台，采用 MIT 协议开源。系统集成 GmSSL 库实现真实的 SM2 密钥生成、数字签名 / 验签与 SM3 哈希计算，支持文件处理、操作审计、数据库管理与 S3 存储，并通过 Systemd 开机自启、Nginx 反向代理实现稳定部署，界面提供安全、可靠的国产化密码学服务。

## 🎯 核心特性

### 密码学功能

- **SM2 密钥对生成**：基于椭圆曲线密码学 (ECC) 的公私钥对生成，支持密钥下载和管理
- **SM3 哈希计算**：对文本或文件进行 256 位密码杂凑，确保数据完整性
- **数字签名**：使用 SM2 私钥对消息或文件进行签名，生成可验证的签名值
- **签名验证**：使用 SM2 公钥验证签名的真实性和完整性，检测消息篡改
- **操作历史**：完整的签名和验证操作记录，支持查询和审计

### 系统特性

- **真实国密算法**：集成 GmSSL 库，调用真实的 SM2/SM3 实现，非模拟或占位代码
- **专业界面设计**：采用手绘草图美学风格，莫兰迪色系，营造创意工作氛围
- **完整的数据库支持**：用户管理、密钥存储、签名历史记录
- **S3 文件存储**：支持文件上传、签名、验证，存储于 S3 兼容存储
- **开机自启**：使用 Systemd 服务实现自动启动和故障恢复
- **反向代理**：集成 Nginx 反向代理，支持 HTTPS 和负载均衡

## 📋 系统要求

| 要求 | 规格 |
|------|------|
| **硬件平台** | Orange Pi 5 Plus (RK3588) |
| **内存** | 8GB RAM 或更高 |
| **存储** | 32GB+ microSD 卡或 eMMC |
| **操作系统** | Ubuntu 22.04 ARM64 |
| **网络** | 以太网或 Wi-Fi |
| **电源** | 5V/4A USB Type-C |

## 🚀 快速开始

### 前置条件

- Orange Pi 5 Plus 开发板已烧写 Ubuntu 22.04
- SSH 连接到开发板
- 网络连接正常

### 一键部署脚本

```bash
# SSH 连接到开发板
ssh orangepi@192.168.1.XXX

# 下载部署脚本
curl -O https://your-repo/deploy.sh
chmod +x deploy.sh

# 执行部署 (需要 sudo 权限)
./deploy.sh

# 等待部署完成 (约 30-60 分钟，取决于网络速度)
```

### 手动部署

详见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📖 使用指南

### 访问应用

```
http://192.168.1.XXX:3000
```

### 基本工作流

#### 1. 生成 SM2 密钥对

1. 登录系统
2. 进入"密钥生成"页面
3. 输入密钥名称 (如: "我的签名密钥")
4. 点击"生成 SM2 密钥对"
5. 复制公钥或下载密钥文件

#### 2. 计算 SM3 哈希

1. 进入"SM3 哈希"页面
2. 选择输入类型 (文本或文件)
3. 输入文本或上传文件
4. 点击"计算 SM3 哈希"
5. 查看和复制哈希值

#### 3. 对消息进行签名

1. 进入"数字签名"页面
2. 选择签名密钥
3. 输入消息或上传文件
4. 点击"对消息进行 SM2 签名"
5. 复制签名值

#### 4. 验证签名

1. 进入"签名验证"页面
2. 输入原始消息或上传文件
3. 粘贴签名值和公钥
4. 点击"验证 SM2 签名"
5. 查看验证结果

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    前端 (React 19)                           │
│  - 手绘草图美学界面                                           │
│  - 侧边栏导航 + 仪表盘布局                                   │
│  - 实时表单验证和错误提示                                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                  反向代理 (Nginx)                            │
│  - SSL/TLS 终止                                              │
│  - 负载均衡                                                  │
│  - 静态文件服务                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP
┌────────────────────▼────────────────────────────────────────┐
│              后端 (Node.js + Express)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  tRPC 路由                                           │   │
│  │  - crypto.generateSm2Key                            │   │
│  │  - crypto.calculateSm3Text/File                     │   │
│  │  - crypto.signMessage/File                          │   │
│  │  - crypto.verifySignature                           │   │
│  │  - crypto.listSm2Keys                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  GmSSL 包装层 (gmssl-wrapper.ts)                    │   │
│  │  - SM2 密钥对生成                                    │   │
│  │  - SM3 哈希计算                                      │   │
│  │  - SM2 签名/验证                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬───────────────────────────────────────────────────┘
         │
    ┌────┴─────────────────────────────────────────────────┐
    │                                                        │
┌───▼──────────────────┐                    ┌──────────────▼──┐
│  MySQL 数据库        │                    │  S3 存储        │
│  - users             │                    │  - 上传文件     │
│  - sm2_keys          │                    │  - 密钥备份     │
│  - signatures        │                    │  - 签名历史     │
│  - verifications     │                    │                 │
└──────────────────────┘                    └─────────────────┘
         │
    ┌────▼──────────────────────────────────────────────────┐
    │  GmSSL C 库 (/usr/local/lib/libgmssl.so)             │
    │  - SM2 椭圆曲线密码学                                │
    │  - SM3 密码杂凑算法                                  │
    │  - 随机数生成                                        │
    └────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
sm-signature-system/
├── client/                          # 前端应用 (React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # 首页仪表盘
│   │   │   ├── KeyGeneration.tsx    # SM2 密钥生成
│   │   │   ├── SM3Hash.tsx          # SM3 哈希计算
│   │   │   ├── SignMessage.tsx      # 数字签名
│   │   │   └── VerifySignature.tsx  # 签名验证
│   │   ├── components/
│   │   │   └── CryptoDashboard.tsx  # 主布局组件
│   │   ├── sketch-theme.css         # 手绘草图美学样式
│   │   ├── App.tsx                  # 应用入口
│   │   └── index.css                # 全局样式
│   ├── public/                      # 静态资源
│   └── package.json
│
├── server/                          # 后端应用 (Node.js)
│   ├── routers/
│   │   └── crypto.ts                # 密码学 tRPC 路由
│   ├── gmssl-wrapper.ts             # GmSSL 包装层
│   ├── crypto-db.ts                 # 数据库操作
│   ├── routers.ts                   # 主路由
│   ├── db.ts                        # 数据库连接
│   └── _core/                       # 框架核心代码
│
├── drizzle/                         # 数据库模型
│   └── schema.ts                    # Drizzle ORM 模型定义
│
├── shared/                          # 共享代码
│   └── const.ts                     # 常量定义
│
├── DEPLOYMENT_GUIDE.md              # 香橙派部署指南 ⭐
├── README.md                        # 本文件
├── package.json                     # 项目配置
├── tsconfig.json                    # TypeScript 配置
└── .env.example                     # 环境变量示例
```

## 🔧 开发指南

### 本地开发环境

```bash
# 克隆仓库
git clone https://github.com/your-repo/sm-signature-system.git
cd sm-signature-system

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 构建生产版本

```bash
# 构建前端
pnpm build

# 构建后端
pnpm build:server

# 启动生产服务器
pnpm start
```

### 运行测试

```bash
# 运行单元测试
pnpm test

# 运行特定测试
pnpm test -- crypto.test.ts

# 生成覆盖率报告
pnpm test -- --coverage
```

## 🔐 安全建议

### 密钥管理

- **私钥保护**：系统不会在网络上传输私钥，私钥仅存储在服务器端
- **密钥备份**：定期下载和备份密钥文件到安全位置
- **访问控制**：使用强密码和 SSH 密钥认证访问服务器
- **审计日志**：所有签名和验证操作都被记录，支持审计

### 网络安全

- **HTTPS**：使用 Let's Encrypt 免费证书启用 HTTPS
- **防火墙**：配置防火墙仅允许必要的端口访问
- **VPN**：对于远程访问，建议使用 VPN 隧道
- **定期更新**：及时更新系统和依赖包

### 数据库安全

- **强密码**：使用复杂密码保护数据库账户
- **备份**：定期备份数据库到安全位置
- **加密连接**：启用 MySQL SSL/TLS 加密连接
- **最小权限**：使用最小权限原则配置数据库用户

## 📊 性能指标

在 Orange Pi 5 Plus (8GB RAM) 上的典型性能表现：

| 操作 | 耗时 | 吞吐量 |
|------|------|--------|
| SM2 密钥生成 | 500-800ms | ~100 keys/min |
| SM3 哈希计算 (1MB) | 50-100ms | ~600 files/min |
| SM2 签名 (1MB) | 200-400ms | ~150 signatures/min |
| SM2 验证 (1MB) | 200-400ms | ~150 verifications/min |
| 并发用户支持 | - | 100-500 users |

## 🐛 已知问题

1. **GmSSL 库编译**：在某些 ARM 架构上可能需要特殊配置
2. **内存使用**：处理大文件 (>100MB) 时内存占用较高
3. **性能瓶颈**：单核 CPU 性能受限，建议使用多进程模式

## 🗺️ 路线图

- [ ] Web UI 国际化 (i18n)
- [ ] 支持 SM4 对称加密
- [ ] 集群部署支持
- [ ] Docker 容器化
- [ ] 移动应用 (iOS/Android)
- [ ] 硬件加密模块支持
- [ ] 区块链集成

## 📝 许可证

本项目采用 **MIT 许可证**。详见 [LICENSE](./LICENSE) 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request
## 项目声明Project Statement
本项目的作者及单位:
The author and affiliation of this project:
- 项目名称(Project Name):SM2SM3-DSVS
- 项者 (Author) : Jing Huang, Donghong Cai
- 作者单位(Affiliation):暨南大学网络空间安全学院(College of Cyber Security,Jinan University)
