# 环境变量配置指南

## 🔑 需要配置的环境变量

### 1. Supabase 环境变量（必需）

**在Supabase控制台设置**：
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目: `mmx-agent-1762072770923`
3. 进入 **Settings** > **Edge Functions** > **Environment variables**

**设置以下变量**：
```
GEMINI_API_KEY=AIzaSyDU2lcbEp1Kgx9dbbBJM2OPFeNG8VHy6N0
```

### 2. Cloudflare Pages 环境变量

**在Cloudflare Pages项目设置中添加**：
1. 进入您的Pages项目
2. 点击 **Settings** > **Environment variables**
3. 添加以下变量：

```
VITE_SUPABASE_URL=https://uwpgbynmxteretbjssfh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cGdieW5teHRlcmV0Ympzc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM0MTUyOTksImV4cCI6MjAzODk5MTI5OX0.9gV0X7n2k4qJ8lU2h6g1zW5F2sR3dQ8mE0oK6J2gM
```

### 3. GitHub Secrets（用于自动部署）

**在GitHub仓库设置Secrets**：
1. 进入仓库 **Settings** > **Secrets and variables** > **Actions**
2. 点击 **New repository secret**

**添加以下密钥**：

#### CLOUDFLARE_API_TOKEN
```
名称: CLOUDFLARE_API_TOKEN
值: [您的Cloudflare API Token]
```

**获取Cloudflare API Token**：
1. 在Cloudflare Dashboard进入 **My Profile** > **API Tokens**
2. 点击 **Create Token**
3. 选择 **Custom token**
4. 设置权限：
   ```
   Account:Cloudflare Pages:Edit
   Zone:Cloudflare Pages:Edit
   ```
5. 复制生成的Token

#### CLOUDFLARE_ACCOUNT_ID
```
名称: CLOUDFLARE_ACCOUNT_ID
值: [您的Cloudflare账户ID]
```

**获取Account ID**：
1. 在Cloudflare Dashboard右侧边栏找到 **Account ID**
2. 复制该ID

#### Supabase 密钥
```
名称: VITE_SUPABASE_URL
值: https://uwpgbynmxteretbjssfh.supabase.co

名称: VITE_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cGdieW5teHRlcmV0Ympzc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM0MTUyOTksImV4cCI6MjAzODk5MTI5OX0.9gV0X7n2k4qJ8lU2h6g1zW5F2sR3dQ8mE0oK6J2gM
```

## 🚀 自动部署流程

配置完所有环境变量后，推送到main分支将自动触发部署：

```bash
git push origin main
```

GitHub Actions将：
1. 安装依赖
2. 构建应用
3. 部署到Cloudflare Pages

## 🔍 验证配置

### 检查Supabase Edge Function
```bash
curl -X POST "https://uwpgbynmxteretbjssfh.supabase.co/functions/v1/ai-chat" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"message": "今天吃什么？", "userProfile": {"height": 170, "weight": 65}}'
```

### 检查Cloudflare Pages部署状态
访问Cloudflare Dashboard > Pages > 您的项目，查看部署状态。

## ⚠️ 安全注意事项

1. **API密钥保护**：
   - 绝不要将API密钥提交到代码中
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥

2. **访问控制**：
   - 确保仓库为私有（如果包含敏感信息）
   - 限制GitHub Actions权限
   - 定期审查访问权限

3. **监控**：
   - 监控API使用量
   - 设置异常告警
   - 定期检查部署日志

## 🛠️ 故障排除

### 常见问题：

**1. GitHub Actions部署失败**
```
检查: Node.js版本 (需要18+)
检查: 环境变量是否正确设置
检查: 依赖安装是否成功
```

**2. Supabase Edge Function失败**
```
检查: GEMINI_API_KEY是否正确设置
检查: Edge Function是否重新部署
查看: Supabase Dashboard > Functions > Logs
```

**3. 网站无法访问**
```
检查: DNS配置是否正确
检查: Cloudflare Pages部署状态
检查: 自定义域名绑定状态
```

**4. AI功能不工作**
```
确认: Gemini API密钥有效
确认: Edge Function已更新
查看: 浏览器控制台错误信息
```

## 📞 获取帮助

如遇到问题：
1. 检查部署日志
2. 查看Supabase/Cloudflare官方文档
3. 在GitHub仓库提交Issue
