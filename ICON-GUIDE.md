# TabBar 图标方案指南

## 🎯 推荐方案

### 方案 1：使用图标生成器（最快）⚡

1. 在浏览器中打开项目根目录的 `icon-generator.html`
2. 点击每个图标即可下载 PNG 文件（已包含 EVA-01 配色）
3. 将下载的 6 个文件放到 `src/assets/icons/` 目录：
   - `home.png` / `home-active.png`
   - `menu.png` / `menu-active.png`
   - `profile.png` / `profile-active.png`
4. 重新编译项目即可

### 方案 2：Iconfont（阿里图标库）⭐

**步骤**：
1. 访问 https://www.iconfont.cn/
2. 注册/登录账号
3. 搜索图标：
   - 首页：搜索 "home" 或 "首页"
   - 菜单：搜索 "menu" 或 "菜单"
   - 我的：搜索 "user" 或 "我的"
4. 点击图标 → 加入购物车
5. 点击右上角购物车 → 下载代码 → 选择 PNG 格式
6. 在下载页面设置颜色：
   - 默认图标颜色：`#CCCCCC`
   - 激活图标颜色：`#39FF14`
7. 下载后重命名并放入 `src/assets/icons/`

**推荐图标集**：
- [Ant Design Icons](https://www.iconfont.cn/collections/detail?cid=9402)
- [Remix Icon](https://www.iconfont.cn/collections/detail?cid=29799)
- [Eva Icons](https://www.iconfont.cn/collections/detail?cid=9334)（与 EVA 同名！）

### 方案 3：临时方案 - 纯文字 TabBar

如果暂时不需要图标，修改 `src/app.config.ts` 中的 TabBar 配置：

```typescript
tabBar: {
  color: '#CCCCCC',
  selectedColor: '#39FF14',
  backgroundColor: '#1a1a1a',
  borderStyle: 'black',
  list: [
    {
      pagePath: 'pages/home/index',
      text: '首页',
      // 暂时移除 iconPath
    },
    {
      pagePath: 'pages/menu/index',
      text: '菜单',
      // 暂时移除 iconPath
    },
    {
      pagePath: 'pages/profile/index',
      text: '我的',
      // 暂时移除 iconPath
    },
  ],
}
```

**注意**：微信小程序可能要求 TabBar 必须有图标，建议优先使用方案 1 或 2。

### 方案 4：免费图标资源网站

1. **IconPark** - https://iconpark.oceanengine.com/
   - 字节跳动出品，2000+ 图标
   - 支持在线编辑颜色
   - 可导出 PNG/SVG

2. **RemixIcon** - https://remixicon.com/
   - 简洁现代风格
   - 可下载 SVG（需转 PNG）

3. **Tabler Icons** - https://tabler-icons.io/
   - 清晰的线性图标
   - 可导出 PNG

### 方案 5：使用 Emoji 临时方案

```typescript
// 在 pages 中使用 emoji 作为视觉标识
tabBar: {
  list: [
    { pagePath: 'pages/home/index', text: '🏠 首页' },
    { pagePath: 'pages/menu/index', text: '📋 菜单' },
    { pagePath: 'pages/profile/index', text: '👤 我的' },
  ],
}
```

## 🎨 图标规格要求

- **尺寸**：81x81 px（推荐 162x162 px 以支持高清屏）
- **格式**：PNG
- **背景**：透明
- **颜色**：
  - 默认：#CCCCCC
  - 激活：#39FF14（EVA-01 荧光绿）

## 📁 文件结构

```
src/
└── assets/
    └── icons/
        ├── home.png
        ├── home-active.png
        ├── menu.png
        ├── menu-active.png
        ├── profile.png
        └── profile-active.png
```

## ⚠️ 常见问题

**Q: 图标不显示？**
A: 检查文件路径是否正确，确保从 `src/` 开始的相对路径

**Q: 图标太小/太大？**
A: 建议使用 162x162 px，系统会自动缩放

**Q: 可以用 SVG 吗？**
A: 小程序 TabBar 不支持 SVG，需要转换为 PNG

## 🚀 快速开始

**最快方式**：
```bash
# 1. 打开图标生成器
open icon-generator.html

# 2. 点击下载所有图标

# 3. 创建目录
mkdir -p src/assets/icons

# 4. 移动文件到目录
mv ~/Downloads/*.png src/assets/icons/

# 5. 重新编译
npm run dev:weapp
```
