# EVA-APP 快速开始指南

> 基于 EVA 后端 + EVA-APP 前端的完整开发流程

---

## 一、环境准备

### 后端（EVA）

```bash
# 1. 确保后端服务已启动
cd D:\code\eva\eva
mvn spring-boot:run

# 访问 http://localhost:8080
# API 文档: http://localhost:8080/doc.html
```

### 前端（EVA-APP）

```bash
# 1. 安装依赖（如果还没有）
cd D:\code\eva\eva-app
pnpm install

# 2. 配置后端地址（已配置好）
# 文件: src/constants/env.ts
# 开发环境: http://localhost:8080
# 生产环境: https://api.eva-app.com（需修改）

# 3. 启动开发服务器
pnpm run dev:weapp

# 4. 使用微信开发者工具打开
# 目录: D:\code\eva\eva-app
# AppID: wx304ecd5300aeb9db（已配置）
```

---

## 二、开发第一个业务功能

### 示例：开发"公告管理"功能

#### Step 1: 后端开发（EVA）

**1.1 数据库已有表（无需创建）**
```sql
-- sys_notice 表已存在
-- 字段: notice_id, notice_title, notice_content, notice_type, status, create_time, etc.
```

**1.2 后端接口已实现（可直接使用）**
```java
// SysNoticeController.java 已实现
GET  /api/system/notice/list     // 查询列表
GET  /api/system/notice/{id}     // 查询详情
POST /api/system/notice          // 新增公告
PUT  /api/system/notice          // 修改公告
DELETE /api/system/notice/{ids}  // 删除公告
```

**1.3 测试接口（Knife4j）**
```
访问: http://localhost:8080/doc.html
找到: 系统管理 > 通知公告
测试接口是否正常
```

#### Step 2: 前端开发（EVA-APP）

**2.1 创建类型定义**

```typescript
// src/constants/types.ts（添加）

/**
 * 通知公告
 */
export interface Notice {
  noticeId: number
  noticeTitle: string
  noticeContent: string
  noticeType: number  // 1通知 2公告
  status: number      // 0正常 1关闭
  createTime: string
  createBy: string
}

export interface NoticeQueryParams {
  pageNum?: number
  pageSize?: number
  noticeTitle?: string
  noticeType?: number
  status?: number
}
```

**2.2 创建 API 服务**

```typescript
// src/services/notice.ts（新建）

import { get, post, put, del } from '@/utils/request'
import type { Notice, NoticeQueryParams, ApiResponse, PageResult } from '@/constants/types'

/**
 * 查询公告列表
 */
export async function getNoticeList(params?: NoticeQueryParams) {
  return get<PageResult<Notice>>('/api/system/notice/list', params)
}

/**
 * 查询公告详情
 */
export async function getNoticeDetail(noticeId: number) {
  return get<Notice>(`/api/system/notice/${noticeId}`)
}

/**
 * 新增公告
 */
export async function addNotice(data: Partial<Notice>) {
  return post('/api/system/notice', data, { showLoading: true })
}

/**
 * 修改公告
 */
export async function updateNotice(data: Notice) {
  return put('/api/system/notice', data, { showLoading: true })
}

/**
 * 删除公告
 */
export async function deleteNotice(noticeIds: number[]) {
  return del(`/api/system/notice/${noticeIds.join(',')}`)
}
```

**2.3 创建列表页面**

```bash
# 创建目录
mkdir -p src/pages/notice
```

```typescript
// src/pages/notice/index.tsx（新建）

import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getNoticeList } from '@/services/notice'
import type { Notice } from '@/constants/types'
import { useAuth } from '@/hooks/useAuth'
import './index.scss'

function NoticeList() {
  useAuth() // 需要登录才能访问

  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getNoticeList({ pageNum: 1, pageSize: 20 })
      if (res.code === 200) {
        setNotices(res.data.list)
      }
    } catch (error) {
      console.error('加载失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (noticeId: number) => {
    Taro.navigateTo({
      url: `/pages/notice/detail/index?id=${noticeId}`
    })
  }

  const getTypeText = (type: number) => {
    return type === 1 ? '通知' : '公告'
  }

  return (
    <View className="notice-list-page">
      <ScrollView scrollY className="scroll-view">
        {loading ? (
          <View className="loading">加载中...</View>
        ) : notices.length === 0 ? (
          <View className="empty">暂无公告</View>
        ) : (
          notices.map((item) => (
            <View
              key={item.noticeId}
              className="notice-item"
              onClick={() => handleItemClick(item.noticeId)}
            >
              <View className="notice-header">
                <Text className="notice-type">{getTypeText(item.noticeType)}</Text>
                <Text className="notice-time">{item.createTime}</Text>
              </View>
              <View className="notice-title">{item.noticeTitle}</View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default NoticeList
```

**2.4 创建页面配置**

```typescript
// src/pages/notice/index.config.ts（新建）

export default definePageConfig({
  navigationBarTitleText: '公告列表',
  navigationBarBackgroundColor: '#1a1a1a',
  navigationBarTextStyle: 'white',
})
```

**2.5 创建样式文件**

```scss
// src/pages/notice/index.scss（新建）

.notice-list-page {
  min-height: 100vh;
  background: #f5f5f5;

  .scroll-view {
    height: 100vh;
  }

  .loading,
  .empty {
    padding: 200px 40px;
    text-align: center;
    font-size: 28px;
    color: #999;
  }

  .notice-item {
    margin: 20px;
    padding: 30px;
    background: #fff;
    border-radius: 16px;

    .notice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;

      .notice-type {
        padding: 8px 20px;
        background: #39FF14;
        color: #1a1a1a;
        font-size: 24px;
        border-radius: 8px;
        font-weight: bold;
      }

      .notice-time {
        font-size: 24px;
        color: #999;
      }
    }

    .notice-title {
      font-size: 32px;
      color: #333;
      font-weight: bold;
      line-height: 1.5;
    }
  }
}
```

**2.6 添加路由**

```typescript
// src/app.config.ts（修改）

export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/menu/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/profile/edit/index',
    'pages/notice/index',  // ✅ 新增
  ],
  // ... 其他配置
})
```

**2.7 添加路由常量**

```typescript
// src/constants/routes.ts（修改）

export const ROUTES = {
  LOGIN: '/pages/login/index',
  HOME: '/pages/home/index',
  MENU: '/pages/menu/index',
  PROFILE: '/pages/profile/index',
  EDIT_PROFILE: '/pages/profile/edit/index',
  NOTICE: '/pages/notice/index',  // ✅ 新增
} as const
```

**2.8 在首页添加入口**

```tsx
// src/pages/home/index.tsx（修改）

import Taro from '@tarojs/taro'
import { ROUTES } from '@/constants/routes'

// 在适当位置添加按钮
<Button onClick={() => Taro.navigateTo({ url: ROUTES.NOTICE })}>
  查看公告
</Button>
```

#### Step 3: 测试

```bash
# 1. 编译小程序
pnpm run dev:weapp

# 2. 打开微信开发者工具
# 3. 登录（账号: admin, 密码: admin123）
# 4. 点击"查看公告"按钮
# 5. 验证列表是否正常显示
```

---

## 三、常用开发模式

### 模式1：纯展示页面（只读）

```typescript
// 示例：产品列表页
function ProductList() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const res = await getProductList()
    setProducts(res.data.list)
  }

  return (
    <View>
      {products.map(item => (
        <ProductItem key={item.id} data={item} />
      ))}
    </View>
  )
}
```

### 模式2：列表 + 详情

```typescript
// 列表页
function OrderList() {
  const handleItemClick = (orderId: number) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${orderId}`
    })
  }

  return <ListView onItemClick={handleItemClick} />
}

// 详情页
function OrderDetail() {
  const { id } = Taro.getCurrentInstance().router?.params || {}

  useEffect(() => {
    loadDetail(Number(id))
  }, [id])

  const loadDetail = async (orderId: number) => {
    const res = await getOrderDetail(orderId)
    setOrder(res.data)
  }

  return <DetailView data={order} />
}
```

### 模式3：表单提交

```typescript
// 创建/编辑页面
function ProductForm() {
  const [form, setForm] = useState({
    name: '',
    price: 0,
    stock: 0,
  })

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateProduct(form)
      } else {
        await addProduct(form)
      }
      Taro.showToast({ title: '保存成功' })
      Taro.navigateBack()
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  return (
    <View>
      <Input value={form.name} onInput={e => setForm({ ...form, name: e.detail.value })} />
      <Button onClick={handleSubmit}>提交</Button>
    </View>
  )
}
```

### 模式4：权限控制

```tsx
// 需要权限才显示的内容
import Permission from '@/components/Permission'

function ProductList() {
  return (
    <View>
      {/* 只有有新增权限的用户才能看到 */}
      <Permission permission="system:product:add">
        <Button onClick={handleAdd}>新增产品</Button>
      </Permission>

      {/* 只有管理员才能看到 */}
      <Permission role="admin">
        <Button onClick={handleDelete}>批量删除</Button>
      </Permission>

      {/* 有任意一个权限即可 */}
      <Permission permission={['system:product:edit', 'system:product:add']} mode="any">
        <Button>操作</Button>
      </Permission>
    </View>
  )
}
```

---

## 四、常见问题

### Q1: 如何配置后端地址？

```typescript
// src/constants/env.ts
const DEV_BASE_URL = 'http://localhost:8080'        // 开发环境
const PROD_BASE_URL = 'https://api.eva-app.com'     // 生产环境

// 如果后端不在 localhost:8080，修改 DEV_BASE_URL
const DEV_BASE_URL = 'http://192.168.1.100:8080'   // 局域网 IP
```

### Q2: 如何调试网络请求？

```typescript
// 1. 查看控制台（微信开发者工具 > Console）
// 所有请求会打印 log

// 2. 查看网络面板（微信开发者工具 > Network）
// 可以看到请求详情

// 3. 如果 401 错误
// 检查 token 是否有效：
console.log(Taro.getStorageSync('eva_token'))
```

### Q3: 如何添加新页面？

```bash
# 1. 创建页面目录
mkdir -p src/pages/xxx

# 2. 创建文件
touch src/pages/xxx/index.tsx
touch src/pages/xxx/index.config.ts
touch src/pages/xxx/index.scss

# 3. 添加到 app.config.ts
pages: ['pages/xxx/index', ...]

# 4. 添加路由常量（可选）
ROUTES.XXX = '/pages/xxx/index'
```

### Q4: 如何处理分页？

```typescript
function ProductList() {
  const [list, setList] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    const res = await getProductList({ pageNum, pageSize: 10 })
    setList([...list, ...res.data.list])
    setHasMore(res.data.total > list.length + res.data.list.length)
    setPageNum(pageNum + 1)
  }

  return (
    <ScrollView
      scrollY
      onScrollToLower={hasMore ? loadMore : undefined}
    >
      {list.map(item => <Item key={item.id} data={item} />)}
    </ScrollView>
  )
}
```

### Q5: 如何上传图片？

```typescript
import Taro from '@tarojs/taro'

const handleUpload = async () => {
  // 1. 选择图片
  const { tempFilePaths } = await Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera']
  })

  // 2. 上传到服务器
  const uploadTask = Taro.uploadFile({
    url: 'http://localhost:8080/api/system/file/upload',
    filePath: tempFilePaths[0],
    name: 'file',
    header: {
      'Authorization': `Bearer ${Taro.getStorageSync('eva_token')}`
    }
  })

  uploadTask.then(res => {
    const data = JSON.parse(res.data)
    console.log('上传成功', data.data.url)
  })
}
```

---

## 五、开发规范

### 文件命名
- 页面文件：`index.tsx`（小写）
- 组件文件：`UserCard.tsx`（大驼峰）
- 服务文件：`user.ts`（小写）
- 工具文件：`format.ts`（小写）

### 代码规范
- 使用 TypeScript
- 使用 Function Component（禁止 Class Component）
- 使用 Hooks（useState, useEffect, 自定义 Hooks）
- Props 定义 interface
- API 调用必须通过 services 层

### 目录结构
```
src/pages/xxx/
├── index.tsx           # 页面主文件
├── index.config.ts     # 页面配置
├── index.scss          # 页面样式
└── components/         # 页面私有组件（可选）
    └── XxxItem.tsx
```

---

## 六、下一步

### 推荐开发顺序

1. **第一周**：开发 1-2 个纯展示页面
   - 公告列表 + 详情
   - 产品列表 + 详情

2. **第二周**：开发带表单的页面
   - 反馈提交
   - 信息编辑

3. **第三周**：开发带权限的页面
   - 数据管理（增删改查）
   - 审批流程

4. **第四周**：封装通用组件
   - List 组件（分页、下拉刷新）
   - Form 组件（表单验证）
   - Upload 组件（图片上传）

### 学习资源

- Taro 文档：https://taro-docs.jd.com/
- React Hooks：https://react.dev/reference/react
- TypeScript：https://www.typescriptlang.org/docs/
- 微信小程序：https://developers.weixin.qq.com/miniprogram/dev/framework/

---

**开始你的第一个业务开发吧！** 🚀
