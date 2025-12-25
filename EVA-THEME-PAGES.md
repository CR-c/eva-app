# EVA-01 主题页面开发完成

## 新增页面

### 1. 首页 (pages/home)
- **功能**: 展示系统状态、快捷功能入口、信息卡片
- **特性**:
  - EVA-01 配色主题
  - 骨架屏加载效果
  - 系统状态实时显示
  - 快捷功能网格布局

### 2. 菜单页 (pages/menu)
- **功能**: 展示系统功能模块入口
- **特性**:
  - 6个功能按钮（SYNC MODE、ANALYSIS、BACKUP、SECURITY、TERMINAL、SETTINGS）
  - 每个按钮独立配色
  - 骨架屏加载
  - 点击反馈动效

### 3. 我的页面 (pages/profile)
- **功能**: 展示个人资料信息
- **特性**:
  - 用户头像展示（带动画边框）
  - 在线状态指示
  - 完整个人信息展示
  - 编辑资料入口
  - 退出登录功能
  - 骨架屏加载

### 4. 编辑资料页 (pages/profile/edit)
- **功能**: 编辑个人资料
- **特性**:
  - 头像上传入口
  - 昵称、手机号、邮箱编辑
  - 性别选择器
  - 生日选择器
  - 地区、个性签名编辑
  - 表单验证

## 新增组件

### Skeleton 骨架屏组件
- **位置**: `src/components/Skeleton/`
- **特性**:
  - EVA-01 配色渐变动画
  - 支持头像模式
  - 支持卡片模式
  - 自定义行数
  - 加载完成自动切换内容

## 主题配色

### EVA-01 TEST TYPE 配色方案
- **主色紫色**: #6A0DAD, #4B0082
- **荧光绿**: #39FF14, #00FF00
- **橙色**: #FF6600
- **背景**: #1a1a1a, #2d2d2d
- **文本**: #FFFFFF, #CCCCCC

## TabBar 配置

三个主页面已配置为 TabBar 页面:
- 首页 (home)
- 菜单 (menu)
- 我的 (profile)

TabBar 样式:
- 背景色: #1a1a1a
- 选中色: #39FF14
- 默认色: #CCCCCC

## 服务接口

### user.ts
新增个人资料相关接口:
- `getUserProfile()` - 获取用户详细信息
- `updateUserProfile()` - 更新用户信息
- `uploadAvatar()` - 上传头像

## 类型扩展

### UserInfo 类型
新增字段:
- `email` - 邮箱
- `gender` - 性别 (0: 未知, 1: 男, 2: 女)
- `birthday` - 生日
- `signature` - 个性签名
- `location` - 地区

## 使用说明

### 启动项目
```bash
npm install
npm run dev:weapp
```

### 页面导航
- 登录成功后自动跳转首页
- 底部 TabBar 可切换三个主页面
- 我的页面点击"编辑"进入编辑页
- 支持退出登录返回登录页

### 注意事项
1. TabBar 图标需要准备资源文件放在 `src/assets/icons/` 目录
2. 头像上传功能需要后端支持
3. 所有接口调用需要配置正确的 `BASE_URL`

## 开发规范遵循

✅ 只使用 Function Component
✅ 请求通过 services 层
✅ 状态管理使用 Zustand
✅ EVA-01 配色主题统一
✅ 骨架屏优化用户体验
✅ 完整的个人资料功能
