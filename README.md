# 摸鱼派鸿蒙客户端

基于摸鱼派开放API V2.3.2开发的鸿蒙原生应用，遵循 HarmonyOS Design 设计规范。

## 功能特性

- 🔐 **登录/注册** - 账号密码登录，获取apiKey
- 💬 **聊天室** - 实时公聊消息，WebSocket通信
- 📝 **文章** - 浏览最近、热门、精华文章，查看文章详情，点赞评论
- ✉️ **私聊** - 一对一私聊，实时消息收发
- 👤 **个人中心** - 查看用户信息、活跃度、积分
- 🌙 **清风明月** - 发布和浏览清风明月动态
- 🔔 **通知中心** - 查看@我、评论、系统通知
- 💰 **积分转账** - 向其他用户转账积分
- ⚙️ **设置** - 深色模式、消息通知、清除缓存

## 鸿蒙特性

### 智感握姿
根据用户握持设备的方式自动调整界面布局：
- 单手握持时，重要操作按钮下移至拇指舒适区
- 双手握持时，对称布局，充分利用屏幕空间

### 沉浸光感
- 透明状态栏，内容延伸至状态栏区域
- 根据背景色自动切换状态栏图标颜色
- 支持全屏模式

### 显示模式适配
- 完整支持浅色/深色模式
- 跟随系统设置自动切换
- 平滑的主题切换过渡

### 响应式布局
- 断点系统：SM (<600vp) / MD (600-840vp) / LG (>840vp)
- 栅格布局：4列/8列/12列自适应
- 屏幕方向检测

### 动画规范
- 符合鸿蒙动画时长规范 (150ms/250ms/350ms)
- 标准缓动曲线
- 按压反馈动画

## 项目结构

```
entry/src/main/ets/
├── entryability/
│   └── EntryAbility.ets          # 应用入口
├── pages/                        # 页面
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
├── components/                   # 组件库
│   └── DesignSystem.ets          # 鸿蒙设计系统组件
├── model/                        # 数据模型
│   ├── User.ets
│   ├── Message.ets
│   ├── Article.ets
│   └── Notification.ets
├── constants/                    # 常量
│   └── DesignTokens.ets          # 设计令牌
├── websocket/                    # WebSocket管理
│   ├── ChatRoomWebSocket.ets
│   └── PrivateChatWebSocket.ets
└── util/                         # 工具类
    ├── HttpUtil.ets              # 网络请求
    ├── StorageUtil.ets           # 本地存储
    ├── TimeUtil.ets              # 时间处理
    ├── ThemeUtil.ets             # 主题管理
    ├── ResponsiveUtil.ets        # 响应式布局
    ├── ImmersiveUtil.ets         # 沉浸式
    └── AnimationUtil.ets         # 动画
```

## 技术实现

| 模块 | 技术方案 |
|------|----------|
| 网络请求 | `@ohos.net.http` 封装REST API |
| WebSocket | `@ohos.net.websocket` 实时通信 |
| 数据存储 | `@ohos.data.preferences` 存储apiKey和配置 |
| 状态管理 | `@State` / `@Link` / `@Provide` |
| 主题系统 | `configuration` 监听系统配置变化 |
| 响应式 | `display` 监听屏幕变化 |
| 沉浸式 | `window` 设置状态栏属性 |

## 开发环境

- DevEco Studio 4.0+
- HarmonyOS SDK API 10+
- Node.js 16+

## 运行说明

1. 使用DevEco Studio打开项目
2. 连接鸿蒙设备或启动模拟器
3. 点击运行按钮启动应用

## 设计规范

详见：
- [鸿蒙设计指南](docs/harmony-design-guide.md)
- [鸿蒙特性实现](docs/harmony-features.md)
- [功能计划](docs/feature-plan.md)

## 相关链接

- [摸鱼派官网](https://fishpi.cn)
- [鸿蒙开发者文档](https://developer.huawei.com/consumer/cn/)
- [HarmonyOS Design](https://developer.huawei.com/consumer/cn/doc/design-guides/)
