# Eva 小程序基础框架

基于 **Taro 4 + React + TypeScript** 的小程序基础框架，开箱即用，快速开发。

## 技术栈

- **框架**: Taro 4
- **视图层**: React 18
- **语言**: TypeScript 5
- **状态管理**: Zustand
- **样式**: SCSS

## 功能特性

- ✅ 微信一键登录
- ✅ 登录态自动恢复
- ✅ Token 自动注入请求头
- ✅ 401 统一处理并跳转登录页
- ✅ 请求防重复
- ✅ 网络异常统一处理
- ✅ 本地缓存封装（支持过期时间）
- ✅ 路由权限控制
- ✅ 全局状态管理
- ✅ 基础 UI 组件

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5
```

### 构建

```bash
# 微信小程序
npm run build:weapp

# H5
npm run build:h5
```

## 目录结构

```
src/
├── pages/           # 页面
│   ├── index/      # 首页
│   └── login/      # 登录页
├── components/      # 组件
│   ├── Loading/    # 加载组件
│   └── Empty/      # 空状态组件
├── hooks/          # 自定义 Hooks
│   └── useAuth.ts  # 权限校验 Hook
├── services/       # 接口服务
│   └── auth.ts     # 登录相关接口
├── store/          # 全局状态
│   └── user.ts     # 用户状态
├── utils/          # 工具函数
│   ├── request.ts  # 请求封装
│   └── cache.ts    # 缓存封装
├── constants/      # 常量
│   ├── types.ts    # 类型定义
│   ├── cache.ts    # 缓存键
│   └── routes.ts   # 路由配置
└── styles/         # 全局样式
```

## 核心功能使用

### 1. 发起请求

所有请求必须通过 `services` 层，禁止页面中直接调用 `Taro.request`。

```typescript
// services/example.ts
import { get, post } from '@/utils/request'

export async function getList() {
  return get('/api/list')
}

export async function createItem(data) {
  return post('/api/item', data, { showLoading: true })
}
```

### 2. 使用全局状态

```typescript
import { useUserStore } from '@/store/user'

function MyComponent() {
  const userInfo = useUserStore((state) => state.userInfo)
  const logout = useUserStore((state) => state.logout)

  return <View>{userInfo?.nickname}</View>
}
```

### 3. 页面权限控制

在需要登录的页面中使用 `useAuth` Hook：

```typescript
import { useAuth } from '@/hooks/useAuth'

function ProtectedPage() {
  useAuth() // 自动校验登录态

  return <View>需要登录才能访问</View>
}
```

### 4. 缓存操作

```typescript
import { setCache, getCache, removeCache } from '@/utils/cache'

// 设置缓存（永久）
setCache('key', data)

// 设置缓存（30 秒过期）
setCache('key', data, 30)

// 读取缓存
const data = getCache('key')

// 删除缓存
removeCache('key')
```

## 开发规范

### 1. 组件规范

- 只能使用 **Function Component**
- 禁止使用 class component

```typescript
// ✅ 正确
function MyComponent() {
  return <View>Hello</View>
}

// ❌ 错误
class MyComponent extends React.Component {}
```

### 2. 请求规范

- 所有请求必须通过 `services` 层
- 禁止页面中直接调用 `Taro.request`

```typescript
// ✅ 正确
// services/user.ts
export async function getUserInfo() {
  return get('/api/user/info')
}

// pages/profile/index.tsx
import { getUserInfo } from '@/services/user'

// ❌ 错误
import Taro from '@tarojs/taro'
Taro.request({ url: '/api/user/info' })
```

### 3. 状态管理规范

- 全局状态使用 **Zustand**
- 页面/组件内部状态使用 `useState`

## API 接口规范

后端接口必须遵循统一响应格式：

```typescript
interface ApiResponse<T> {
  code: number    // 200 成功，401 未授权，其他为业务错误
  msg: string     // 错误信息
  data: T         // 响应数据
}
```

## 环境配置

修改 `src/utils/request.ts` 中的 `BASE_URL` 配置后端接口地址：

```typescript
const BASE_URL = 'https://api.example.com'
```

## 登录流程

1. 用户点击登录按钮
2. 调用 `wx.login` 获取 code
3. 将 code 发送到后端 `/api/auth/login`
4. 后端返回 token 和用户信息
5. 前端保存到全局状态和本地缓存
6. 后续请求自动携带 token

## 注意事项

1. **微信小程序配置**：修改 `project.config.json` 中的 `appid`
2. **接口地址**：修改 `src/utils/request.ts` 中的 `BASE_URL`
3. **路由白名单**：在 `src/constants/routes.ts` 中配置不需要登录的页面

## 开发建议

- 优先复用已有能力
- 保持代码可维护性
- 宁可少写，也不乱写
- 不引入未说明的第三方库

## License

MIT
