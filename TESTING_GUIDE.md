# 测试和部署验证指南

本文档提供了在 Orange Pi 5 Plus 上测试和验证国密 SM2/SM3 数字签名系统的完整步骤。

## 📋 测试清单

### 1. 环境验证测试

#### 1.1 GmSSL 库验证

```bash
# 检查 gmssl-python 安装
python3 -c "import gmssl; print('✓ gmssl-python 已安装')"

# 测试 SM3 哈希
echo -n "abc" | gmssl sm3
# 预期输出: 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0

# 测试 SM2 密钥生成
gmssl genpkey -algorithm SM2 -out test_key.pem
gmssl pkey -in test_key.pem -text -noout
```

#### 1.2 Node.js 环境验证

```bash
# 检查 Node.js 版本
node --version  # 应为 v22.13.0 或更高

# 检查 pnpm 版本
pnpm --version  # 应为 10.x 或更高

# 检查依赖安装
cd /home/ubuntu/sm-signature-system
pnpm list | head -20
```

#### 1.3 数据库验证

```bash
# 检查 MySQL 服务
sudo systemctl status mysql

# 测试数据库连接
mysql -u sm_user -p sm_signature_system -e "SELECT 1;"

# 检查数据库表
mysql -u sm_user -p sm_signature_system -e "SHOW TABLES;"
```

### 2. 后端功能测试

#### 2.1 启动开发服务器

```bash
cd /home/ubuntu/sm-signature-system
pnpm dev

# 输出应该显示:
# ✓ [2026-05-03T18:01:51.629Z] Server running on http://localhost:3000/
```

#### 2.2 测试 tRPC 路由

```bash
# 在另一个终端中测试 API

# 测试 SM2 密钥生成
curl -X POST http://localhost:3000/api/trpc/crypto.generateSm2Key \
  -H "Content-Type: application/json" \
  -d '{"keyName":"test-key"}'

# 测试 SM3 哈希计算
curl -X POST http://localhost:3000/api/trpc/crypto.calculateSm3Text \
  -H "Content-Type: application/json" \
  -d '{"text":"hello world"}'

# 测试数字签名
curl -X POST http://localhost:3000/api/trpc/crypto.signMessage \
  -H "Content-Type: application/json" \
  -d '{"keyId":1,"message":"test message"}'
```

#### 2.3 检查日志

```bash
# 查看应用日志
tail -f /var/log/sm-signature/app.log

# 查看 GmSSL 调用日志
grep "GmSSL" /var/log/sm-signature/app.log

# 查看错误日志
grep "ERROR" /var/log/sm-signature/app.log
```

### 3. 前端功能测试

#### 3.1 访问应用

在浏览器中打开：

```
http://192.168.1.XXX:3000
```

#### 3.2 测试用户认证

1. 点击"登录系统"按钮
2. 使用 Manus OAuth 登录
3. 验证用户信息显示正确

#### 3.3 测试密钥生成功能

1. 进入"密钥生成"页面
2. 输入密钥名称 (如: "测试密钥")
3. 点击"生成 SM2 密钥对"
4. 验证公钥和私钥显示
5. 点击"下载密钥文件"
6. 验证文件下载成功

#### 3.4 测试 SM3 哈希计算

1. 进入"SM3 哈希"页面
2. 输入文本 (如: "hello world")
3. 点击"计算 SM3 哈希"
4. 验证哈希值显示为 64 位十六进制字符串
5. 上传文件并计算哈希
6. 验证文件哈希计算成功

#### 3.5 测试数字签名

1. 进入"数字签名"页面
2. 选择之前生成的密钥
3. 输入消息 (如: "test message")
4. 点击"对消息进行 SM2 签名"
5. 验证签名值显示
6. 复制签名值供验证使用

#### 3.6 测试签名验证

1. 进入"签名验证"页面
2. 粘贴原始消息
3. 粘贴签名值
4. 粘贴公钥
5. 点击"验证 SM2 签名"
6. 验证结果显示"✓ 通过"

#### 3.7 测试操作历史

1. 进入"操作历史"页面
2. 查看"SM3 哈希"标签页
3. 验证之前的哈希计算记录显示
4. 查看"数字签名"标签页
5. 验证之前的签名记录显示
6. 查看"签名验证"标签页
7. 验证之前的验证记录显示

### 4. 集成测试

#### 4.1 完整工作流测试

1. **密钥生成** → 生成新密钥对
2. **哈希计算** → 计算消息的 SM3 哈希
3. **数字签名** → 使用私钥签名消息
4. **签名验证** → 使用公钥验证签名
5. **历史查询** → 查看所有操作记录

#### 4.2 错误处理测试

测试以下错误场景：

```bash
# 测试无效的密钥 ID
curl -X POST http://localhost:3000/api/trpc/crypto.signMessage \
  -H "Content-Type: application/json" \
  -d '{"keyId":99999,"message":"test"}'

# 测试无效的签名验证
curl -X POST http://localhost:3000/api/trpc/crypto.verifySignature \
  -H "Content-Type: application/json" \
  -d '{"message":"test","signature":"invalid","publicKey":"invalid"}'

# 测试大文件处理
dd if=/dev/zero bs=1M count=100 | curl -X POST http://localhost:3000/api/upload \
  -F "file=@-"
```

#### 4.3 并发测试

```bash
# 使用 Apache Bench 进行并发测试
ab -n 100 -c 10 http://localhost:3000/

# 使用 wrk 进行性能测试
wrk -t4 -c100 -d30s http://localhost:3000/api/trpc/crypto.calculateSm3Text
```

### 5. 性能测试

#### 5.1 密钥生成性能

```bash
# 测试 100 次密钥生成
time for i in {1..100}; do
  curl -s -X POST http://localhost:3000/api/trpc/crypto.generateSm2Key \
    -H "Content-Type: application/json" \
    -d "{\"keyName\":\"key-$i\"}" > /dev/null
done

# 预期: 100 次密钥生成耗时 50-80 秒
```

#### 5.2 哈希计算性能

```bash
# 测试 1MB 文件的哈希计算
dd if=/dev/urandom bs=1M count=1 of=/tmp/test_1mb.bin
time curl -X POST http://localhost:3000/api/upload \
  -F "file=@/tmp/test_1mb.bin" \
  | jq '.hash'

# 预期: 50-100ms
```

#### 5.3 签名性能

```bash
# 测试 100 次签名操作
time for i in {1..100}; do
  curl -s -X POST http://localhost:3000/api/trpc/crypto.signMessage \
    -H "Content-Type: application/json" \
    -d "{\"keyId\":1,\"message\":\"test-$i\"}" > /dev/null
done

# 预期: 100 次签名耗时 20-40 秒
```

### 6. 安全测试

#### 6.1 私钥保护测试

```bash
# 验证私钥不会在网络上传输
tcpdump -i eth0 -A 'tcp port 3000' | grep -i "private"

# 验证私钥不会在日志中显示
grep -r "private" /var/log/sm-signature/

# 预期: 无结果
```

#### 6.2 会话安全测试

```bash
# 检查 Cookie 安全标志
curl -v http://localhost:3000/ 2>&1 | grep -i "set-cookie"

# 预期输出应包含: HttpOnly, Secure, SameSite
```

#### 6.3 输入验证测试

```bash
# 测试 SQL 注入防护
curl -X POST http://localhost:3000/api/trpc/crypto.calculateSm3Text \
  -H "Content-Type: application/json" \
  -d '{"text":"test\"; DROP TABLE users; --"}'

# 预期: 正常处理，不执行 SQL 注入

# 测试 XSS 防护
curl -X POST http://localhost:3000/api/trpc/crypto.calculateSm3Text \
  -H "Content-Type: application/json" \
  -d '{"text":"<script>alert(1)</script>"}'

# 预期: 正常处理，脚本不执行
```

## 🚀 部署验证

### 1. 生产环境部署

```bash
# 构建应用
pnpm build

# 启动生产服务器
pnpm start

# 验证服务运行
curl http://localhost:3000/health
```

### 2. Systemd 服务验证

```bash
# 检查服务状态
sudo systemctl status sm-signature.service

# 查看服务日志
sudo journalctl -u sm-signature.service -n 50

# 测试服务重启
sudo systemctl restart sm-signature.service
sleep 5
curl http://localhost:3000/
```

### 3. Nginx 反向代理验证

```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log

# 测试反向代理
curl http://192.168.1.XXX/

# 测试 WebSocket (如果使用)
wscat -c ws://192.168.1.XXX/ws
```

### 4. 数据库备份验证

```bash
# 备份数据库
mysqldump -u sm_user -p sm_signature_system > backup.sql

# 验证备份
mysql -u sm_user -p sm_signature_system < backup.sql

# 检查备份大小
ls -lh backup.sql
```

## 📊 测试报告模板

```markdown
# 测试报告 - 国密 SM2/SM3 数字签名系统

**测试日期**: 2026-05-03  
**测试环境**: Orange Pi 5 Plus, Ubuntu 22.04  
**测试人员**: [名称]  

## 测试结果

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 环境验证 | ✓ 通过 | GmSSL、Node.js、MySQL 正常 |
| 后端功能 | ✓ 通过 | 所有 tRPC 路由正常工作 |
| 前端功能 | ✓ 通过 | 所有页面和功能正常 |
| 集成测试 | ✓ 通过 | 完整工作流正常 |
| 性能测试 | ✓ 通过 | 性能指标符合预期 |
| 安全测试 | ✓ 通过 | 无安全漏洞 |
| 部署验证 | ✓ 通过 | 生产环境正常运行 |

## 性能指标

- SM2 密钥生成: 500-800ms
- SM3 哈希计算 (1MB): 50-100ms
- SM2 签名: 200-400ms
- SM2 验证: 200-400ms
- 并发用户支持: 100-500

## 问题和建议

无重大问题。

## 签名

测试人员: ________________  
日期: ________________
```

## 🔧 故障排查

### 问题 1: GmSSL 调用失败

**症状**: `ImportError: libgmssl.so: cannot open shared object file`

**排查步骤**:

```bash
# 检查库文件
find /usr -name "libgmssl.so*"

# 更新库缓存
sudo ldconfig

# 检查库路径
echo $LD_LIBRARY_PATH

# 添加库路径
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
```

### 问题 2: 签名验证失败

**症状**: 签名验证总是返回"失败"

**排查步骤**:

```bash
# 检查消息和签名是否匹配
echo "message" | gmssl sm3

# 检查公钥和私钥是否配对
gmssl pkey -in private.pem -pubout -out public.pem

# 手动测试签名
echo "test" | gmssl sm2sign -key private.pem

# 手动验证签名
gmssl sm2verify -key public.pem -signature sig.bin
```

### 问题 3: 性能下降

**症状**: 签名/验证操作变慢

**排查步骤**:

```bash
# 检查系统资源
top
free -h
df -h

# 检查数据库连接
mysql -u sm_user -p sm_signature_system -e "SHOW PROCESSLIST;"

# 检查应用日志
tail -f /var/log/sm-signature/app.log | grep -i "slow"
```

## 📚 参考资源

- [GmSSL 官方文档](https://github.com/guanzhi/GmSSL)
- [gmssl-python 文档](https://github.com/GmSSL/GmSSL-Python)
- [Orange Pi 文档](https://www.orangepi.org/)
- [MySQL 性能优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

**最后更新**: 2026年5月3日
