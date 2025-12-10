# MiniPlus 家庭膳食ERP系统

🤖 **完整的家庭膳食ERP解决方案，集成AI助手、智能采购和烹饪指导**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fminiplus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)

## ✨ 核心功能模块

### 👥 家庭成员管理系统
- **健康档案管理**: 身高、体重、BMI自动计算
- **过敏信息追踪**: 常见过敏原和自定义过敏源管理
- **慢性疾病管理**: 疾病类型和状态跟踪
- **饮食偏好设置**: 口味偏好、宗教禁忌、饮食限制

### 🌏 全球美食风向标
- **6大全球美食趋势**: 实时更新的国际美食潮流
- **季节性食材推荐**: 基于当前时间（12月）的优质食材
- **地域特色美食**: 探索不同地区的烹饪文化
- **个性化推荐**: 基于家庭成员健康档案的智能推荐

### 🛒 智能采购系统
- **SKU智能映射**: 食谱食材自动转换为可购买商品
- **多平台价格比较**: 京东、美团、盒马三个平台实时比价
- **库存管理**: 库存跟踪、过期提醒、使用记录
- **一键购物清单**: 基于健康档案自动生成智能购物清单

### 👨‍🍳 智能烹饪流程
- **双灶台调度算法**: 并行任务优化，提高烹饪效率
- **语音交互指导**: Web Speech API实现的自然语音对话
- **实时进度监控**: 烹饪状态跟踪和智能调整建议
- **步骤导航系统**: 分步骤烹饪指导和进度跟踪

### 🤖 Gemini AI 智能助手
- **自然语言对话**: 基于Gemini API的智能交互
- **个性化营养建议**: 根据家庭成员数据提供定制建议
- **食谱智能推荐**: 基于健康状况和喜好的食谱推荐
- **食材替换建议**: 智能识别并推荐替代食材

## 🚀 快速开始

### 方法一：Vercel一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fminiplus)

1. **Fork仓库**
   ```bash
   git clone https://github.com/your-username/miniplus.git
   cd miniplus
   ```

2. **安装依赖并构建**
   ```bash
   pnpm install
   pnpm run build
   ```

3. **部署到Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入GitHub仓库
   - 配置构建设置：
     ```
     Framework: Vite
     Build Command: pnpm run build
     Output Directory: dist
     Install Command: pnpm install
     ```

4. **配置环境变量**
   在Vercel Dashboard中添加：
   ```env
   VITE_SUPABASE_URL=https://uwpgbynmxteretbjssfh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   GEMINI_API_KEY=AIzaSyD3rYigiJc1j3tOlqrXAobfYC5HkkFhyQY
   ```

### 方法二：本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/miniplus.git
cd miniplus

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 环境变量配置

创建 `.env.local` 文件：
```env
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI配置
GEMINI_API_KEY=your_gemini_api_key

# Google Maps（可选）
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

详细部署指南请查看：[Vercel部署指南.md](./Vercel部署指南.md)

## 🔧 技术栈

### 前端
- **React 18.3.1** + **TypeScript** - 现代化前端框架
- **Vite 6.0.1** - 极速构建工具和开发服务器
- **Tailwind CSS** - 原子化CSS框架
- **Radix UI** - 无障碍组件库
- **React Router** - 客户端路由管理
- **React Hook Form** - 表单状态管理
- **Lucide React** - 现代化图标系统

### 后端
- **Supabase** - 后端即服务平台
- **PostgreSQL** - 关系型数据库
- **Row Level Security (RLS)** - 数据库级安全策略
- **Edge Functions (Deno)** - 无服务器函数运行时
- **Supabase Auth** - 用户认证和授权
- **Supabase Storage** - 文件存储服务

### AI集成
- **Google Gemini API** - 大语言模型集成
- **Web Speech API** - 语音识别和合成
- **Harris-Benedict公式** - BMR营养计算算法
- **智能推荐引擎** - 个性化推荐算法

### 开发工具
- **Vite** - 构建工具和开发服务器
- **ESLint + Prettier** - 代码质量保证
- **TypeScript** - 类型安全开发
- **pnpm** - 高效的包管理器

### 部署
- **Vercel** - 前端部署和CDN
- **GitHub** - 代码版本控制
- **Supabase** - 后端服务托管

## 📊 数据库架构

### 核心表结构
- `profiles` - 用户配置文件和基本信息
- `families` - 家庭基本信息
- `family_members` - 家庭成员详情
- `health_profiles` - 健康档案（身高、体重、BMI、过敏、慢性病）
- `dietary_preferences` - 饮食偏好（口味、限制、宗教禁忌）
- `food_trends` - 全球美食趋势数据
- `seasonal_ingredients` - 季节性食材信息
- `regional_cuisines` - 地域美食文化
- `ingredient_skus` - 食材SKU映射表
- `pantry_inventory` - 家庭库存管理
- `shopping_lists` - 智能购物清单
- `price_history` - 价格历史记录
- `recipes` - 完整食谱数据库
- `cooking_sessions` - 烹饪会话记录
- `cooking_steps` - 烹饪步骤详情
- `cooking_progress` - 烹饪进度跟踪

### 数据安全
- **Row Level Security (RLS)** - 确保用户数据隔离
- **JWT认证** - 安全的用户身份验证
- **数据加密** - 传输和存储数据加密

## 🎨 设计系统

### 色彩方案
- **主色调**: 抹茶绿 `#4A9F7E`
- **辅助色**: 清新绿 `#6DB193`
- **背景色**: 纯净白 `#FFFFFF`
- **文字色**: 深灰 `#1F2937`

### 组件规范
- **卡片设计**: 大圆角(16px)，优雅阴影
- **按钮样式**: 胶囊型，渐变背景
- **字体系统**: 清晰易读的无衬线字体
- **间距系统**: 8px基准网格系统

## 🧪 测试

### 本地开发
```bash
npm install
npm run dev
```

### 构建测试
```bash
npm run build
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 📦 部署配置

### GitHub Actions
项目包含完整的CI/CD配置：
- 自动安装依赖
- 代码质量检查
- 构建优化
- 自动部署到Cloudflare Pages

### 环境变量配置
```bash
# Supabase配置
VITE_SUPABASE_URL=https://uwpgbynmxteretbjssfh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3cGdieW5teHRlcmV0Ympzc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTM0ODMsImV4cCI6MjA3NzYyOTQ4M30._PpWP_4ktmA-3h3GbO5kHeAuZRxpyxnt-wnIa1VSaOc

# Gemini AI配置
GEMINI_API_KEY=AIzaSyD3rYigiJc1j3tOlqrXAobfYC5HkkFhyQY

# Google Maps API（可选）
GOOGLE_MAPS_API_KEY=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk

# 测试账户（用于演示）
TEST_EMAIL=cpekbsxy@minimax.com
TEST_PASSWORD=Se6sXhju35
```

## 🔒 安全特性

### 数据保护
- **行级安全(RLS)**: 确保数据访问安全
- **用户认证**: Supabase Auth提供安全认证
- **API密钥保护**: 环境变量存储敏感信息
- **CORS配置**: 跨域请求安全控制

### 隐私合规
- **数据加密**: 传输和存储加密
- **用户控制**: 用户可删除个人数据
- **最小权限**: 仅收集必要数据
- **合规设计**: 遵守数据保护法规

## 📈 性能优化

### 前端优化
- **代码分割**: 按需加载减少初始包大小
- **图片优化**: WebP格式，懒加载
- **缓存策略**: 智能缓存提升加载速度
- **CDN加速**: Cloudflare全球CDN网络

### 后端优化
- **数据库索引**: 查询性能优化
- **缓存层**: Redis缓存热点数据
- **Edge Functions**: 全球边缘节点部署
- **自动扩缩**: 根据流量自动调整

## 🐛 故障排除

### 常见问题

**1. 部署失败**
```
解决方案:
- 检查Node.js版本 (需要18+)
- 验证环境变量配置
- 查看构建日志详情
```

**2. AI功能不工作**
```
解决方案:
- 确认Gemini API密钥有效
- 检查Supabase Edge Function状态
- 查看浏览器控制台错误
```

**3. 数据库连接失败**
```
解决方案:
- 验证Supabase配置
- 检查网络连接
- 确认API密钥权限
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范
- 使用TypeScript进行类型安全
- 遵循ESLint配置规则
- 编写有意义的提交信息
- 添加必要的测试用例

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具
- [Supabase](https://supabase.com/) - 后端即服务平台
- [Google Gemini](https://ai.google.dev/) - AI语言模型
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件库
- [Vercel](https://vercel.com/) - 前端部署平台
- [Lucide](https://lucide.dev/) - 图标系统
- [React Router](https://reactrouter.com/) - 路由管理

## 📞 联系我们

- **项目主页**: [GitHub仓库](https://github.com/YOUR_USERNAME/miniplus)
- **在线演示**: [Vercel部署地址](https://your-vercel-url.vercel.app)
- **问题反馈**: [GitHub Issues](https://github.com/YOUR_USERNAME/miniplus/issues)
- **测试账户**: cpekbsxy@minimax.com / Se6sXhju35

## 🎯 项目状态

- ✅ **家庭成员管理系统** - 已完成
- ✅ **全球美食风向标** - 已完成  
- ✅ **智能采购系统** - 已完成
- ✅ **智能烹饪流程** - 已完成
- 🔄 **健康数据分析** - 开发中
- 🔄 **供应链闭环** - 开发中

---

<div align="center">

**从简单食谱应用到完整的家庭膳食ERP系统** 🍎✨

[立即部署](./quick-deploy.sh) • [Vercel指南](./Vercel部署指南.md) • [测试清单](./测试清单.md) • [问题反馈](https://github.com/YOUR_USERNAME/miniplus/issues)

</div>
