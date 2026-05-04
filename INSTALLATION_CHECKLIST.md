# 安装检查清单

本清单用于验证 Orange Pi 5 Plus 上的国密 SM2/SM3 数字签名系统安装是否完整。

## ✅ 前置环境检查

- [ ] Orange Pi 5 Plus 开发板已启动
- [ ] Ubuntu 22.04 ARM64 系统已安装
- [ ] 网络连接正常
- [ ] SSH 连接可用
- [ ] 系统时间正确

## ✅ 系统依赖检查

- [ ] build-essential 已安装
- [ ] cmake 已安装
- [ ] git 已安装
- [ ] python3-dev 已安装
- [ ] nodejs 已安装
- [ ] npm 已安装
- [ ] pnpm 已安装全局

## ✅ GmSSL 库检查

- [ ] GmSSL 源代码已下载
- [ ] GmSSL 已编译
- [ ] GmSSL 已安装
- [ ] 动态库缓存已更新
- [ ] gmssl 命令可用
- [ ] SM3 哈希测试通过
- [ ] SM2 密钥生成测试通过

## ✅ gmssl-python 检查

- [ ] gmssl-python 已安装
- [ ] gmssl-python 版本正确
- [ ] Python SM3 测试通过
- [ ] Python SM2 测试通过

## ✅ 数据库检查

- [ ] MySQL 服务已安装
- [ ] MySQL 服务已启动
- [ ] 数据库已创建 (sm_signature_system)
- [ ] 数据库用户已创建 (sm_user)
- [ ] 数据库权限已配置

## ✅ 应用代码检查

- [ ] 应用代码已克隆
- [ ] 项目结构完整
- [ ] pnpm install 已执行
- [ ] node_modules 目录存在

## ✅ 环境变量检查

- [ ] .env 文件已创建
- [ ] DATABASE_URL 已配置
- [ ] JWT_SECRET 已配置
- [ ] 所有必需的环境变量已设置

## ✅ 数据库迁移检查

- [ ] drizzle-kit generate 已执行
- [ ] drizzle-kit migrate 已执行
- [ ] 数据库表已创建

## ✅ 构建检查

- [ ] pnpm build 执行成功
- [ ] 前端构建成功
- [ ] 后端构建成功
- [ ] 没有 TypeScript 错误

## ✅ 开发服务器检查

- [ ] pnpm dev 启动成功
- [ ] 前端可访问 (http://localhost:3000)
- [ ] 后端 API 可访问
- [ ] 没有启动错误

## ✅ 功能测试检查

- [ ] SM2 密钥生成功能正常
- [ ] SM3 哈希计算功能正常
- [ ] 数字签名功能正常
- [ ] 签名验证功能正常
- [ ] 操作历史记录功能正常

## ✅ 生产部署检查

- [ ] pnpm start 启动成功
- [ ] Nginx 已安装和配置
- [ ] Nginx 服务已启动
- [ ] Systemd 服务已创建和启用

## ✅ 最终验证

- [ ] 系统在 Orange Pi 5 Plus 上正常运行
- [ ] 所有功能都已测试
- [ ] 系统可以开机自启
- [ ] 系统可以正常重启

---

**检查日期**: ________________  
**检查人**: ________________  
**检查结果**: ✅ 全部通过 / ⚠️ 有问题
