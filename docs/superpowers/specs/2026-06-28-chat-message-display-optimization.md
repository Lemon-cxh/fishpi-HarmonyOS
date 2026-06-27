# 聊天室消息显示优化设计文档

## 日期
2026-06-28

## 概述
优化聊天室页面的消息显示效果，参照 Slack/Discord 风格，添加时间分组、消息合并、胶囊气泡等功能，提升用户体验。

## 设计目标
1. 提供类似主流聊天应用的消息显示体验
2. 合理显示消息时间，便于用户了解对话时间线
3. 区分自己和他人的消息，提升可读性
4. 优化连续消息的显示，减少视觉冗余

## 核心功能

### 1. 时间分组显示
- **触发条件**：两条消息时间间隔超过5分钟
- **显示位置**：在消息组上方居中显示
- **时间格式**：
  - 今天的消息：`今天 14:30`
  - 昨天的消息：`昨天 14:30`
  - 今年更早的消息：`3月15日 14:30`
  - 跨年消息：`2025年3月15日 14:30`

### 2. 消息合并
- **合并条件**：
  - 同一用户发送
  - 时间间隔在5分钟内
- **合并效果**：
  - 只显示一次头像和用户名
  - 多条消息垂直排列
  - 气泡之间间距 4px

### 3. 胶囊气泡
- **圆角规则**：
  - 圆角半径：12px
  - 直角位置圆角：4px（不完全直角，保持美观）
  - 自己的消息：右上角直角
  - 他人的消息：左上角直角
- **连续气泡**：
  - 中间气泡四角都是小圆角(4px)
  - 首尾气泡保持胶囊形状

### 4. 背景色区分
- **自己的消息**：淡蓝色背景 (#E3F2FD)
- **他人的消息**：浅灰色背景 (#F0F0F0)
- **红包消息**：浅红色背景 (#FFF1F0)，红色边框

## 数据结构

### MessageGroup
```typescript
interface MessageGroup {
  userId: string;           // 用户ID
  userName: string;         // 用户名
  userAvatarURL: string;    // 用户头像URL
  isSelf: boolean;          // 是否是自己发送的消息
  messages: ChatMessage[];  // 消息列表
  showTime: boolean;        // 是否显示时间分隔线
  timeLabel: string;        // 时间标签文本
}
```

### BubbleStyle
```typescript
interface BubbleStyle {
  topLeft: number;      // 左上圆角
  topRight: number;     // 右上圆角
  bottomLeft: number;   // 左下圆角
  bottomRight: number;  // 右下圆角
}
```

## 组件结构

```
ChatRoomPage
├── Header (顶部栏)
│   ├── 标题 + 在线人数
│   └── 话题标签
├── MessageList (消息列表)
│   ├── TimeDivider (时间分隔线)
│   ├── MessageGroup (消息组)
│   │   ├── Avatar (头像 - 40x40px圆形)
│   │   ├── UserName (用户名 - 14sp)
│   │   └── MessageBubbles (消息气泡组)
│   │       └── MessageBubble (单个气泡)
│   │           ├── 普通文本消息
│   │           └── 红包消息
│   └── BottomSpacer (底部占位符 - 16px)
└── InputArea (输入区域)
```

## 样式规范

### 气泡样式
- **最大宽度**：屏幕宽度的 70%
- **内边距**：左右 12px，上下 8px
- **文字字号**：15sp
- **文字颜色**：#333333
- **气泡间距**：4px（连续气泡）
- **消息组间距**：12px

### 头像样式
- **尺寸**：40x40px
- **形状**：圆形
- **背景色**：#E8E8E8（加载失败时）
- **与用户名间距**：12px

### 用户名样式
- **字号**：14sp
- **字重**：Medium
- **颜色**：
  - 自己：#1890FF
  - 他人：#333333

### 时间分隔线样式
- **字号**：12sp
- **颜色**：#999999
- **对齐**：居中
- **上下间距**：16px

### 红包消息样式
- **背景色**：#FFF1F0
- **边框**：1px #FF4D4F
- **图标尺寸**：24x24px
- **文字颜色**：#FF4D4F
- **内边距**：12px

## 关键算法

### 时间分组判断
```typescript
function shouldShowTimeDivider(currentMsg: ChatMessage, prevMsg: ChatMessage): boolean {
  if (!prevMsg) return true;
  
  const currentTime = new Date(currentMsg.time);
  const prevTime = new Date(prevMsg.time);
  const timeDiff = currentTime.getTime() - prevTime.getTime();
  
  return timeDiff > 5 * 60 * 1000; // 5分钟
}
```

### 消息合并判断
```typescript
function shouldMergeToGroup(currentMsg: ChatMessage, group: MessageGroup): boolean {
  // 不同用户不合并
  if (currentMsg.userName !== group.userName) return false;
  
  // 时间间隔超过5分钟不合并
  const lastMsg = group.messages[group.messages.length - 1];
  const lastTime = new Date(lastMsg.time);
  const currentTime = new Date(currentMsg.time);
  const timeDiff = currentTime.getTime() - lastTime.getTime();
  
  return timeDiff <= 5 * 60 * 1000;
}
```

### 气泡圆角计算
```typescript
function getBubbleStyle(index: number, total: number, isSelf: boolean): BubbleStyle {
  const radius = 12;
  const sharp = 4;
  
  if (isSelf) {
    // 自己的消息：右上角直角
    if (total === 1) {
      return { topLeft: radius, topRight: sharp, bottomLeft: radius, bottomRight: radius };
    } else if (index === 0) {
      return { topLeft: radius, topRight: sharp, bottomLeft: radius, bottomRight: sharp };
    } else if (index === total - 1) {
      return { topLeft: sharp, topRight: sharp, bottomLeft: radius, bottomRight: radius };
    } else {
      return { topLeft: sharp, topRight: sharp, bottomLeft: sharp, bottomRight: sharp };
    }
  } else {
    // 他人的消息：左上角直角
    if (total === 1) {
      return { topLeft: sharp, topRight: radius, bottomLeft: radius, bottomRight: radius };
    } else if (index === 0) {
      return { topLeft: sharp, topRight: radius, bottomLeft: sharp, bottomRight: radius };
    } else if (index === total - 1) {
      return { topLeft: sharp, topRight: sharp, bottomLeft: radius, bottomRight: radius };
    } else {
      return { topLeft: sharp, topRight: sharp, bottomLeft: sharp, bottomRight: sharp };
    }
  }
}
```

## 实现计划

### 阶段1：数据结构准备
1. 定义 `MessageGroup` 接口
2. 定义 `BubbleStyle` 接口
3. 实现时间格式化工具函数

### 阶段2：核心逻辑实现
1. 实现 `shouldShowTimeDivider` 函数
2. 实现 `shouldMergeToGroup` 函数
3. 实现 `groupMessages` 消息分组函数
4. 实现 `getBubbleStyle` 圆角计算函数

### 阶段3：UI组件重构
1. 创建 `TimeDivider` 时间分隔线组件
2. 创建 `MessageGroup` 消息组组件
3. 创建 `MessageBubble` 消息气泡组件
4. 重构 `ChatRoomPage` 消息列表渲染逻辑

### 阶段4：样式优化
1. 应用胶囊气泡样式
2. 应用背景色区分
3. 优化间距和布局
4. 处理红包消息特殊样式

### 阶段5：测试验证
1. 测试时间分组显示
2. 测试消息合并逻辑
3. 测试气泡圆角效果
4. 测试滚动到底部功能
5. 测试红包消息显示

## 边界情况处理

1. **空消息列表**：显示空状态提示
2. **单条消息**：正常显示，无合并
3. **超长消息**：自动换行，最大宽度70%
4. **头像加载失败**：显示默认背景色
5. **时间格式异常**：显示原始时间字符串
6. **红包消息合并**：红包与普通消息可合并

## 性能优化

1. **消息分组缓存**：避免重复计算
2. **虚拟滚动**：大量消息时保持流畅
3. **延迟渲染**：滚动时延迟加载头像
4. **时间计算优化**：缓存时间格式化结果

## 兼容性

- 支持普通文本消息
- 支持红包消息
- 支持Markdown消息
- 兼容现有WebSocket消息格式
- 保持现有API调用不变
