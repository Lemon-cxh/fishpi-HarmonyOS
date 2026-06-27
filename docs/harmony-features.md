# 鸿蒙特性实现说明

## 概述

本文档说明摸鱼派鸿蒙应用如何实现 HarmonyOS Design 的核心特性。

---

## 一、智感握姿 (Smart Grip)

### 实现方式

通过 `ResponsiveUtil` 工具类实现：

```typescript
// 获取握持模式
const gripMode = ResponsiveUtil.getGripMode();

// 设置握持模式
ResponsiveUtil.setGripMode(GripMode.SINGLE_HAND);

// 获取握持偏移量 (单手模式下操作按钮下移)
const offset = ResponsiveUtil.getGripOffset();
```

### 应用场景

| 场景 | 单手握持 | 双手握持 |
|------|----------|----------|
| 发送按钮 | 下移 80vp | 正常位置 |
| 底部Tab栏 | 下移 | 正常位置 |
| 主要操作 | 靠近拇指区 | 居中显示 |

### 代码示例

```typescript
// 登录按钮位置根据握持模式调整
Button('登录')
  .margin({ bottom: ResponsiveUtil.getGripOffset() })
```

---

## 二、沉浸光感 (Immersive Light)

### 实现方式

通过 `ImmersiveUtil` 工具类实现：

```typescript
// 初始化沉浸式
await ImmersiveUtil.init(windowStage);

// 设置沉浸式状态栏
await ImmersiveUtil.setupImmersive();

// 根据主题更新状态栏样式
await ImmersiveUtil.updateStatusBarStyle();
```

### 特性说明

1. **透明状态栏**：内容延伸至状态栏区域
2. **自适应图标**：根据背景色自动切换状态栏图标颜色
3. **全屏模式**：视频播放时隐藏状态栏

### 代码示例

```typescript
// 设置状态栏亮色模式 (浅色背景用深色图标)
await ImmersiveUtil.setStatusBarLight();

// 设置状态栏暗色模式 (深色背景用浅色图标)
await ImmersiveUtil.setStatusBarDark();

// 全屏模式
await ImmersiveUtil.setFullScreen(true);
```

---

## 三、显示模式适配

### 实现方式

通过 `ThemeUtil` 工具类实现完整的深色/浅色模式支持：

```typescript
// 初始化主题
await ThemeUtil.init();

// 设置主题模式
await ThemeUtil.setThemeMode(ThemeMode.DARK);    // 深色模式
await ThemeUtil.setThemeMode(ThemeMode.LIGHT);   // 浅色模式
await ThemeUtil.setThemeMode(ThemeMode.SYSTEM);  // 跟随系统

// 监听主题变化
ThemeUtil.addThemeChangeListener((isDark: boolean) => {
  // 更新UI
});
```

### 色彩方案

#### 浅色模式
```typescript
const LightColorScheme = {
  primary: '#1890FF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  // ...
};
```

#### 深色模式
```typescript
const DarkColorScheme = {
  primary: '#3091FF',
  background: '#000000',
  surface: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBEB',
  // ...
};
```

### 系统配置监听

```typescript
// 在 EntryAbility 中监听系统配置变化
onConfigurationUpdate(newConfig: configuration.Configuration): void {
  const isDark = newConfig.colorMode === configuration.ColorMode.COLOR_MODE_DARK;
  // 触发主题更新
}
```

---

## 四、响应式布局

### 断点系统

通过 `ResponsiveUtil` 实现多断点适配：

| 断点 | 宽度范围 | 设备类型 |
|------|----------|----------|
| SM | < 600vp | 手机竖屏 |
| MD | 600vp - 840vp | 手机横屏、折叠屏 |
| LG | > 840vp | 平板 |

### 栅格系统

```typescript
// 获取当前断点
const breakpoint = ResponsiveUtil.getBreakpoint();

// 获取响应式列数
const columns = ResponsiveUtil.getGridColumns(); // SM:4, MD:8, LG:12

// 根据断点返回不同值
const padding = ResponsiveUtil.select({
  sm: 16,
  md: 24,
  lg: 32
});
```

### 屏幕方向

```typescript
// 获取屏幕方向
const orientation = ResponsiveUtil.getOrientation();

// 是否为横屏
const isLandscape = ResponsiveUtil.isLandscape();
```

---

## 五、动画规范

### 动画时长

| 类型 | 时长 | 场景 |
|------|------|------|
| 快速 | 150ms | 按钮反馈、开关切换 |
| 标准 | 250ms | 页面切换、展开收起 |
| 缓慢 | 350ms | 复杂动画、主题切换 |

### 缓动曲线

```typescript
// 标准曲线
const CURVE_STANDARD = cubicBezier(0.4, 0, 0.2, 1);

// 进入曲线
const CURVE_ENTER = cubicBezier(0, 0, 0.2, 1);

// 退出曲线
const CURVE_EXIT = cubicBezier(0.4, 0, 1, 1);

// 弹性曲线
const CURVE_SPRING = springMotion(0.2, 0.8);
```

### 按压反馈

```typescript
// 按钮按压动画
.scale({
  x: this.isPressed ? 0.98 : 1,
  y: this.isPressed ? 0.98 : 1
})
.animation({
  duration: 150,
  curve: Curve.EaseInOut
})
```

---

## 六、设计令牌 (Design Tokens)

### 使用方式

```typescript
import { Spacing, BorderRadius, FontSize, ComponentSize } from '../constants/DesignTokens';

// 使用间距
.padding(Spacing.LG)  // 16vp

// 使用圆角
.borderRadius(BorderRadius.MD)  // 8vp

// 使用字体大小
.fontSize(FontSize.LG)  // 18fp

// 使用组件尺寸
.height(ComponentSize.BUTTON_LG)  // 48vp
```

### 令牌列表

| 类别 | 令牌 | 值 |
|------|------|-----|
| 间距 | XS/SM/MD/LG/XL/XXL | 4/8/12/16/24/32 vp |
| 圆角 | SM/MD/LG/FULL | 4/8/12/999 vp |
| 字号 | XS/SM/MD/LG/XL/XXL | 12/14/16/18/22/28 fp |
| 按钮 | SM/MD/LG | 32/40/48 vp |
| 头像 | SM/MD/LG/XL | 32/48/64/96 vp |

---

## 七、组件库

### 使用方式

```typescript
import { PrimaryButton, ContentCard, UserAvatar } from '../components/DesignSystem';

// 主按钮
PrimaryButton({ label: '登录', onClick: this.handleLogin })

// 内容卡片
ContentCard() {
  // 卡片内容
}

// 用户头像
UserAvatar({ src: avatarUrl, size: 48 })
```

### 可用组件

| 组件 | 说明 |
|------|------|
| PrimaryButton | 主按钮 |
| SecondaryButton | 次按钮 |
| ContentCard | 内容卡片 |
| ListItemRow | 列表项 |
| UserAvatar | 用户头像 |
| Tag | 标签 |
| EmptyState | 空状态 |
| LoadingState | 加载状态 |
| DividerLine | 分割线 |
| SectionTitle | 区域标题 |

---

## 八、无障碍设计

### 触摸目标

所有可点击元素最小尺寸为 48vp × 48vp：

```typescript
Button('点击')
  .width(48)
  .height(48)
```

### 文字对比度

- 正文：对比度 ≥ 4.5:1
- 大文字：对比度 ≥ 3:1

### 屏幕阅读器

```typescript
Text('用户名')
  .accessibilityLabel('请输入用户名')
```

---

## 九、最佳实践

1. **始终使用设计令牌**：避免硬编码数值
2. **响应式布局**：使用断点系统适配不同屏幕
3. **主题适配**：使用 ThemeUtil 获取颜色，确保深色模式兼容
4. **动画规范**：遵循鸿蒙动画时长和曲线规范
5. **沉浸式体验**：合理使用沉浸式状态栏
6. **无障碍支持**：添加 accessibilityLabel
