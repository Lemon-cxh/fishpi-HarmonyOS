# 摸鱼派鸿蒙应用 - 功能计划文档

> 基于摸鱼派开放API V2.3.2 开发的鸿蒙原生应用

---

## 一、应用架构

采用底部Tab导航 + 页面栈导航模式，包含以下主要模块：

- **认证模块** - 登录/注册
- **聊天模块** - 公聊聊天室、私聊
- **内容模块** - 文章、清风明月
- **用户模块** - 个人中心、用户详情
- **通知模块** - 消息通知

---

## 二、页面结构

### 1. 登录页 `LoginPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| Logo | Image | 应用图标 |
| 用户名输入框 | TextInput | 输入账号 |
| 密码输入框 | TextInput | 输入密码（密文） |
| 登录按钮 | Button | 调用 `POST /api/getKey` |
| 注册入口 | Text | 跳转注册页 |

**API接口：**
- 登录：`POST /api/getKey`
- 获取用户信息：`GET /api/user`

---

### 2. 首页 - 聊天室 `ChatRoomPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 消息列表 | List | 公聊消息列表，支持下拉加载更多 |
| 消息项 | ListItem | 头像 + 用户名 + 消息内容 + 时间 |
| 红包消息 | ListItem | 特殊样式，点击领取 |
| 在线人数 | Text | 顶部显示当前在线用户数 |
| 话题标签 | Text | 当前讨论话题 |
| 输入框 | TextInput | 消息输入区域 |
| 发送按钮 | Button | 调用 `POST /chat-room/send` |
| 表情按钮 | Button | 打开表情面板 |
| 图片按钮 | Button | 选择并上传图片 |

**API接口：**
- 获取消息列表：`GET /chat-room/getMessage`
- 加载更多消息：`GET /chat-room/more`
- 发送消息：`POST /chat-room/send`
- 撤回消息：`DELETE /chat-room/revoke/{oId}`
- 领取红包：`POST /chat-room/red-packet/open`
- 获取表情：`GET /users/emotions`
- 文件上传：`POST /upload`

**WebSocket：** `wss://fishpi.cn/chat-room-channel`
- 心跳：每20秒发送 `-hb-`
- 消息类型：`msg` / `online` / `revoke` / `redPacketStatus` / `discussChanged` / `barrage`

---

### 3. 文章列表页 `ArticleListPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| Tab栏 | Tabs | 最近 / 热门 / 精华 / 最近回复 |
| 文章列表 | List | 文章卡片列表，支持分页 |
| 文章卡片 | ListItem | 标题 + 摘要 + 作者 + 点赞数 + 评论数 |
| 发布按钮 | Button | 跳转文章编辑页 |

**API接口：**
- 最近文章：`GET /api/articles/recent`
- 热门文章：`GET /api/articles/recent/hot`
- 精华文章：`GET /api/articles/recent/good`
- 最近回复：`GET /api/articles/recent/reply`

---

### 4. 文章详情页 `ArticleDetailPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 标题 | Text | 文章标题 |
| 作者信息 | Row | 头像 + 用户名 + 关注按钮 |
| 文章内容 | Web/Text | Markdown渲染内容 |
| 互动栏 | Row | 点赞 / 感谢 / 评论数 |
| 评论列表 | List | 评论区 |
| 评论输入框 | TextInput | 底部固定评论框 |

**API接口：**
- 文章详情：`GET /api/article/{articleId}`
- 点赞文章：`POST /vote/up/article`
- 感谢文章：`POST /article/thank?articleId={articleId}`
- 获取评论：`GET /api/comment/{articleId}`
- 发表评论：`POST /comment`
- 点赞评论：`POST /vote/up/comment`
- 感谢评论：`POST /comment/thank`
- 删除评论：`POST /comment/{commentId}/remove`

---

### 5. 私聊列表页 `PrivateChatListPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 聊天列表 | List | 最近私聊会话列表 |
| 会话项 | ListItem | 头像 + 用户名 + 最后消息 + 时间 + 未读标记 |

**API接口：**
- 获取聊天列表：`GET /chat/get-list`
- 检查未读消息：`GET /chat/has-unread`

---

### 6. 私聊详情页 `PrivateChatDetailPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 消息列表 | List | 聊天记录（支持分页加载） |
| 消息气泡 | ListItem | 区分发送/接收，显示头像和内容 |
| 输入框 | TextInput | 消息输入 |
| 发送按钮 | Button | 通过WebSocket发送 |

**API接口：**
- 获取聊天消息：`GET /chat/get-message`
- 标记已读：`GET /chat/mark-as-read`

**WebSocket：** `wss://fishpi.cn/chat-channel?apiKey={apiKey}&toUser={userName}`

---

### 7. 我的页面 `ProfilePage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 头像 | Image | 用户头像 |
| 用户名 | Text | 显示用户名 |
| 活跃度 | Progress | 活跃度进度条 |
| 签到按钮 | Button | 领取昨日活跃度奖励 |
| 积分 | Text | 当前积分余额 |
| 菜单列表 | List | 功能入口 |

**菜单项：**
- 我的文章
- 我的清风明月
- 我的关注
- 积分转账
- 通知中心
- 设置

**API接口：**
- 获取用户信息：`GET /api/user`
- 获取活跃度：`GET /user/liveness`
- 获取昨日奖励：`GET /activity/yesterday-liveness-reward-api`
- 查询是否已领取：`GET /api/activity/is-collected-liveness`

---

### 8. 通知页 `NotificationPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| Tab栏 | Tabs | @我 / 评论 / 系统通知 |
| 通知列表 | List | 通知消息列表 |
| 通知项 | ListItem | 图标 + 内容摘要 + 时间 |

**API接口：**
- 获取通知列表：`GET /api/getNotifications`
- 获取未读通知数：`GET /notifications/unread/count`
- 标记已读：`GET /notifications/make-read/{type}`

---

### 9. 清风明月页 `BreezemoonPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 列表 | List | 清风明月动态列表 |
| 动态项 | ListItem | 内容 + 作者 + 时间 |
| 发布按钮 | Button | 打开发布弹窗 |

**API接口：**
- 获取列表：`GET /api/breezemoons`
- 发布：`POST /breezemoon`
- 获取用户动态：`GET /api/user/{userName}/breezemoons`

---

### 10. 用户详情页 `UserDetailPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 头像 | Image | 用户头像 |
| 用户名 | Text | 用户名 |
| 关注按钮 | Button | 关注/取消关注 |
| 私聊按钮 | Button | 跳转私聊 |
| Tab栏 | Tabs | 文章 / 清风明月 |
| 内容列表 | List | 用户发布的内容 |

**API接口：**
- 获取用户信息：`GET /user/{userName}`
- 关注用户：`POST /follow/user`
- 取消关注：`POST /unfollow/user`
- 用户文章：`GET /api/articles/recent` (带用户参数)
- 用户清风明月：`GET /api/user/{userName}/breezemoons`

---

### 11. 设置页 `SettingsPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 账号信息 | ListItem | 显示当前账号 |
| 消息通知 | Toggle | 开关通知提醒 |
| 深色模式 | Toggle | 主题切换 |
| 清除缓存 | Button | 清理本地数据 |
| 退出登录 | Button | 清除apiKey，返回登录页 |
| 关于 | ListItem | 版本信息 |

---

### 12. 积分转账页 `TransferPage`

| 元素 | 类型 | 说明 |
|------|------|------|
| 接收用户 | TextInput | 输入对方用户名 |
| 转账金额 | TextInput | 输入积分数量 |
| 备注 | TextInput | 转账备注（可选） |
| 确认按钮 | Button | 执行转账 |

**API接口：**
- 转账积分：`POST /point/transfer`

---

## 三、核心功能流程

```
┌─────────────┐
│   启动页     │
└──────┬──────┘
       ▼
┌─────────────┐    未登录    ┌─────────────┐
│   检查登录   │─────────────▶│   登录页     │
└──────┬──────┘              └──────┬──────┘
       │ 已登录                     │ 登录成功
       ▼                           ▼
┌─────────────────────────────────────────┐
│              主页面 (Tabs)               │
├─────────┬─────────┬─────────┬──────────┤
│  聊天室  │  文章   │  私聊   │   我的   │
└─────────┴─────────┴─────────┴──────────┘
```

---

## 四、技术实现

| 模块 | 技术方案 |
|------|----------|
| 网络请求 | `@ohos.net.http` 封装REST API |
| WebSocket | `@ohos.net.websocket` 实时通信 |
| 数据存储 | `@ohos.data.preferences` 存储apiKey和配置 |
| 状态管理 | `@State` / `@Link` / `@Provide` / `@Consume` |
| 图片加载 | `@ohos.image` 处理图片显示 |
| Markdown渲染 | Web组件或自定义渲染 |

---

## 五、项目结构规划

```
entry/src/main/ets/
├── entryability/
│   └── EntryAbility.ets          # 应用入口
├── pages/
│   ├── LoginPage.ets             # 登录页
│   ├── MainPage.ets              # 主页面(Tab容器)
│   ├── ChatRoomPage.ets          # 聊天室
│   ├── ArticleListPage.ets       # 文章列表
│   ├── ArticleDetailPage.ets     # 文章详情
│   ├── PrivateChatListPage.ets   # 私聊列表
│   ├── PrivateChatDetailPage.ets # 私聊详情
│   ├── ProfilePage.ets           # 我的
│   ├── NotificationPage.ets      # 通知
│   ├── BreezemoonPage.ets        # 清风明月
│   ├── UserDetailPage.ets        # 用户详情
│   ├── SettingsPage.ets          # 设置
│   └── TransferPage.ets          # 积分转账
├── components/                   # 公共组件
│   ├── MessageItem.ets           # 消息项组件
│   ├── ArticleCard.ets           # 文章卡片组件
│   ├── UserAvatar.ets            # 用户头像组件
│   └── ChatBubble.ets            # 聊天气泡组件
├── model/                        # 数据模型
│   ├── User.ets
│   ├── Message.ets
│   ├── Article.ets
│   └── Notification.ets
├── service/                      # API服务层
│   ├── HttpUtil.ets              # 网络请求封装
│   ├── AuthService.ets           # 认证服务
│   ├── ChatService.ets           # 聊天服务
│   ├── ArticleService.ets        # 文章服务
│   ├── UserService.ets           # 用户服务
│   └── NotificationService.ets   # 通知服务
├── websocket/                    # WebSocket管理
│   ├── ChatRoomWebSocket.ets     # 公聊WebSocket
│   └── PrivateChatWebSocket.ets  # 私聊WebSocket
└── util/                         # 工具类
    ├── StorageUtil.ets           # 本地存储
    ├── TimeUtil.ets              # 时间处理
    └── MarkdownUtil.ets          # Markdown解析
```

---

## 六、开发计划

| 阶段 | 内容 | 预计工作量 |
|------|------|-----------|
| Phase 1 | 项目初始化 + 网络层封装 + 登录功能 | 基础框架 |
| Phase 2 | 聊天室页面 + WebSocket通信 | 核心功能 |
| Phase 3 | 文章模块（列表+详情+评论） | 内容展示 |
| Phase 4 | 私聊功能 | 社交功能 |
| Phase 5 | 个人中心 + 通知 + 设置 | 完善功能 |
| Phase 6 | 清风明月 + 用户详情 + 转账 | 扩展功能 |
